const startBtn = document.querySelector("#start-button");
const helpBtn = document.querySelector("#help-button");
const menuBtn = document.querySelector("#menu-button");
const saveBtn = document.querySelector("#save-button");
const loadBtn = document.querySelector("#load-button");
const nameInput = document.querySelector("#player-name-input");
const menuDiv = document.querySelector("#menu");
const gameDiv = document.querySelector("#game");
const helpDiv = document.querySelector("#help");
const statsDiv = document.querySelector("#stats-div");
const gameTable = document.querySelector("#game-table");
const leaderBoardDiv = document.querySelector("#leaderboard");
const gameWonDiv = document.querySelector("#game-won");
const saveDiv = document.querySelector("#save-div");
const nameOutputs = document.querySelectorAll("#player-name-output");
const levelOutputs = document.querySelectorAll("#level-output");
const finishedTimeOuput = document.querySelector("#time-output");
const timeOutput = document.querySelector("#elapsed-time-output");
const saveText = document.querySelector("#save-game-text");
const leaderBoardList = document.querySelector("#leaderboard-list");
let timerInterval;
let tiles;
let startTime;
let storedTime;
let elapsedTime;
let lakeTilesNum;
let stage;
let name;

startBtn.addEventListener("click", (e) => {
    StartGame(true);
});

loadBtn.addEventListener("click", (e) => {
    if (localStorage.getItem("storedGame") !== null) {
        StartGame(false);
    }
})

helpBtn.addEventListener("click", (e) => {
    menuDiv.style.display = "none";
    helpDiv.style.display = "block";
})

menuBtn.addEventListener("click", (e) => {
    helpDiv.style.display = "none";
    menuDiv.style.display = "block";
})

saveBtn.addEventListener("click", (e) => {
    saveText.style.visibility = "visible";
    localStorage.setItem("storedGame", JSON.stringify(tiles));
    localStorage.setItem("storedStage", stage);
    localStorage.setItem("storedName", name);
    localStorage.setItem("storedTime", elapsedTime);
    setTimeout(() => {
        saveText.style.visibility = "hidden";
    }, 1000)
})

function UpdateTimeSaved() {
    elapsedTime = Date.now() - startTime + storedTime;
    timeOutput.innerHTML = FormatTime(Math.floor(elapsedTime / 1000));
}

function UpdateTimeNew() {
    elapsedTime = Date.now() - startTime;
    timeOutput.innerHTML = FormatTime(Math.floor(elapsedTime / 1000));
}

function StartGame(isNewGame) {
    startTime = Date.now();
    name = nameInput.value === '' ? "The Nameless" : nameInput.value;
    let selectedDificulty = document.querySelector('input[name="difficulty-select"]:checked').value;
    menuDiv.style.display = "none";
    GenerateBoard(selectedDificulty, isNewGame);
    gameDiv.style.display = "block";
    if (isNewGame) {
        timerInterval = setInterval(UpdateTimeNew, 1000);
    } else {
        storedTime = parseInt(localStorage.getItem("storedTime"));
        timerInterval = setInterval(UpdateTimeSaved, 1000);
    }
}

function FormatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

function GenerateBoard(difficulty, isNewGame) {
    let n;
    if (isNewGame) {
        const isHard = difficulty === "hard";
        n = isHard ? 7 : 5;
        let m = Math.floor(Math.random() * 5) + 1;
        stage = m;
        if (isHard) {
            m += 5;
        }
        tiles = GenerateTiles(m);
    } else {
        tiles = JSON.parse(localStorage.getItem("storedGame"));
        stage = parseInt(localStorage.getItem("storedStage"));
        name = localStorage.getItem("storedName");
        n = tiles.length;
    }
    nameOutputs.forEach(nameOutput => {
        nameOutput.innerHTML = name;
    });
    lakeTilesNum = CountLakeTiles(tiles, n);
    const table = document.createElement('table');
    table.classList.add(`table${n}`);
    for (let i = 0; i < n; i++) {
        const row = document.createElement('tr');
        for (let j = 0; j < n; j++) {
            const cell = document.createElement('td');
            cell.style.backgroundImage = `url('./img/bg/${tiles[i][j].type}.png')`
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    gameTable.appendChild(table);
}

function CountLakeTiles(tiles, n) {
    let s = 0;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (tiles[i][j].type === 1) {
                s++;
            }
        }
    }
    return s;
}

gameTable.addEventListener("mousedown", (e) => {
    if (!e.target.matches("td")) {
        return;
    }  
    let yPos = e.target.parentNode.rowIndex;
    let xPos = e.target.cellIndex;
    if (e.button === 0) {
        UpdateLeftClick(yPos, xPos, tiles);
        if (CheckIfWon(yPos, xPos, tiles, lakeTilesNum)) {
            GameWon();
        }
    } else if (e.button === 2) {
        e.preventDefault();
        UpdateRightClick(yPos, xPos, tiles);
    }
    e.target.style.backgroundImage = `url('./img/bg/${tiles[yPos][xPos].type}.png')`
})

gameTable.addEventListener("contextmenu", (e) => {
    if (e.target.matches("td")) {
      e.preventDefault();
    }
})

function GameWon() {
    statsDiv.style.display = "none";
    gameTable.style.display = "none";
    saveDiv.style.display = "none";
    gameWonDiv.style.display = "block";
    leaderBoardDiv.style.display = "block";
    levelOutputs.forEach(levelOutput => {
        levelOutput.innerHTML = stage;
    });
    clearInterval(timerInterval);
    finishedTimeOuput.innerHTML = FormatTime(Math.floor(elapsedTime / 1000));
    CalculateLeaderBoard();
}

function CalculateLeaderBoard() {
    let stats = {name: name, time: Math.floor(elapsedTime / 1000)};
    console.log(stats);
    let currentLeaderBoard = localStorage.getItem(`level${stage}`) ;
    currentLeaderBoard = currentLeaderBoard ? JSON.parse(currentLeaderBoard) : [];
    currentLeaderBoard.push(stats);
    currentLeaderBoard.sort((a, b) => a.time - b.time);
    currentLeaderBoard = currentLeaderBoard.splice(0, 3);
   for(const player of currentLeaderBoard) {
        const li = document.createElement("li");
        li.innerHTML = `${player.name} - ${FormatTime(parseInt(player.time))}`;
        leaderBoardList.appendChild(li);
    }
    localStorage.setItem(`level${stage}`, JSON.stringify(currentLeaderBoard));
    localStorage.removeItem("storedGame");
    localStorage.removeItem("storedStage");
    localStorage.removeItem("storedName");
    localStorage.removeItem("storedTime");
}

function createTile() {
    return {
        connections: { up: false, right: false, down: false, left: false },
        type: 0
    }
}

function GenerateTiles(m) {
    const n = m < 6 ? 5 : 7;
    const tiles = [];
    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            row.push(createTile());
        }
        tiles.push(row);
    }
    CreateLevel(m, tiles);
    return tiles;
}

function CreateLevel(m, tiles) {
    switch (m) {
        case 1:
            CreateLvl1(tiles);
            break;
        case 2:
            CreateLvl2(tiles);
            break;
        case 3:
            CreateLvl3(tiles);
            break;
        case 4:
            CreateLvl4(tiles);
            break;
        case 5:
            CreateLvl5(tiles);
            break;
        case 6:
            CreateLvl6(tiles);
            break;
        case 7:
            CreateLvl7(tiles);
            break;
        case 8:
            CreateLvl8(tiles);
            break;
        case 9:
            CreateLvl9(tiles);
            break;
        case 10:
            CreateLvl10(tiles);
            break;
        default:
            break;
    }
}

function CreateLvl1(tiles) {
    tiles[0][1].type = 13;
    tiles[0][4].type = 1;
    tiles[1][3].type = 8;
    tiles[1][4].type = 1;
    tiles[2][0].type = 8;
    tiles[2][2].type = 14;
    tiles[3][3].type = 1;
    tiles[4][2].type = 15;
}

function CreateLvl2(tiles) {
    tiles[0][0].type = 1;
    tiles[0][2].type = 9;
    tiles[1][1].type = 14;
    tiles[1][4].type = 14;
    tiles[2][0].type = 8;
    tiles[2][1].type = 1;
    tiles[2][2].type = 15;
    tiles[3][3].type = 1;
}

function CreateLvl3(tiles) {
    tiles[0][2].type = 9;
    tiles[1][4].type = 8;
    tiles[2][1].type = 14;
    tiles[2][2].type = 8;
    tiles[3][1].type = 1;
    tiles[4][1].type = 9;
    tiles[4][4].type = 14;
}

function CreateLvl4(tiles) {
    tiles[0][3].type = 9;
    tiles[2][0].type = 8;
    tiles[2][2].type = 13;
    tiles[2][4].type = 13;
    tiles[4][2].type = 1;
    tiles[4][3].type = 15;    
}

function CreateLvl5(tiles) {
    tiles[0][2].type = 9;
    tiles[1][1].type = 12;
    tiles[2][0].type = 8;
    tiles[2][3].type = 15;
    tiles[3][2].type = 8;
    tiles[3][3].type = 1;
    tiles[4][1].type = 14;  
}

function CreateLvl6(tiles) {
    tiles[0][1].type = 13;
    tiles[0][2].type = 1;
    tiles[0][3].type = 1;
    tiles[0][5].type = 9;
    tiles[1][0].type = 8;
    tiles[2][2].type = 8;
    tiles[3][3].type = 15;
    tiles[4][0].type = 15;
    tiles[4][2].type = 13;
    tiles[4][4].type = 9;
    tiles[4][6].type = 1;
    tiles[6][3].type = 9;
}

function CreateLvl7(tiles) {
    tiles[0][2].type = 1;
    tiles[1][0].type = 8;
    tiles[1][2].type = 9;
    tiles[1][5].type = 14;
    tiles[2][2].type = 9;
    tiles[2][6].type = 8;
    tiles[3][0].type = 12;
    tiles[4][1].type = 1;
    tiles[4][3].type = 13;
    tiles[5][1].type = 12;
    tiles[6][2].type = 1;
}

function CreateLvl8(tiles) {
    tiles[0][2].type = 9;
    tiles[1][6].type = 8;
    tiles[2][0].type = 1;
    tiles[2][2].type = 15;
    tiles[4][1].type = 1;
    tiles[4][2].type = 15;
    tiles[4][4].type = 9;
    tiles[5][0].type = 8;
    tiles[5][5].type = 13;
    tiles[6][2].type = 1;
    tiles[6][3].type = 15;
}

function CreateLvl9(tiles) {
    tiles[1][3].type = 8;
    tiles[1][5].type = 14;
    tiles[2][2].type = 15;
    tiles[3][1].type = 9;
    tiles[3][3].type = 1;
    tiles[3][5].type = 9;
    tiles[4][2].type = 14;
    tiles[4][4].type = 13;
    tiles[5][0].type = 8;
    tiles[5][5].type = 15;
}

function CreateLvl10(tiles) {
    tiles[1][5].type = 12;
    tiles[2][1].type = 9;
    tiles[2][2].type = 9;
    tiles[2][4].type = 13;
    tiles[4][2].type = 12;
    tiles[4][4].type = 1;
    tiles[5][1].type = 14;
    tiles[5][3].type = 8;
}

function UpdateLeftClick(yPos, xPos, tiles) {
    let clickedTile = tiles[yPos][xPos];
    let newTileType = CalculateNewTileTypeLeftClick(clickedTile.type);
    clickedTile.type = newTileType;
    UpdateConnections(clickedTile, newTileType);

}

function UpdateRightClick(yPos, xPos, tiles) {
    let clickedTile = tiles[yPos][xPos];
    let newTileType = CalculateNewTileTypeRightClick(clickedTile.type);
    clickedTile.type = newTileType;
    UpdateConnections(clickedTile, newTileType);
}

function CheckIfWon(yPos, xPos, tiles, lakeTilesNum) {
    let n = tiles.length;
    let direction;
    let connectedTiles = 0;
    let selectedTile;
    let startingXPos;
    let startingYPos;
    do {
        connectedTiles++;
        selectedTile = tiles[yPos][xPos];
        if (selectedTile.connections.up && yPos > 0 && direction !== "down") { 
            yPos--;
            direction = "up";
        } else if(selectedTile.connections.right && xPos < n - 1 && direction !== "left") {
            xPos++;
            direction = "right";
        } else if (selectedTile.connections.down && yPos < n - 1 && direction !== "up") {
            yPos++;
            direction = "down";
        } else if (selectedTile.connections.left && xPos > 0 && direction !== "right") {
            xPos--;
            direction = "left";
        } else {
            return false;
        }
        if (connectedTiles === 1) {
            startingYPos = yPos;
            startingXPos = xPos;
        }
    } while (IsConnected(yPos, xPos, tiles, direction) && (yPos !== startingYPos || xPos !== startingXPos || connectedTiles === 1));
    return connectedTiles === (n * n - lakeTilesNum) + 1;
}

function IsConnected(yPos, xPos, tiles, direction) {
    switch (direction) {
        case "up":
            return tiles[yPos][xPos].connections.down;
        case "right":
            return tiles[yPos][xPos].connections.left;
        case "down":
            return tiles[yPos][xPos].connections.up;
        case "left":
            return tiles[yPos][xPos].connections.right;
    }
    return false;
}

function UpdateConnections(tile, n) {
    if (n === 2 || n === 10) {
        tile.connections.up = true;
        tile.connections.down = true;
        tile.connections.left = false;
        tile.connections.right = false;
    } else if (n === 3 || n === 11) {
        tile.connections.up = false;
        tile.connections.down = false;
        tile.connections.left = true;
        tile.connections.right = true;
    } else if (n === 4 || n === 16) {
        tile.connections.up = false;
        tile.connections.down = true;
        tile.connections.left = false;
        tile.connections.right = true;
    } else if (n === 5 || n === 17) {
        tile.connections.up = false;
        tile.connections.down = true;
        tile.connections.left = true;
        tile.connections.right = false;
    } else if (n === 6 || n === 18) {
        tile.connections.up = true;
        tile.connections.down = false;
        tile.connections.left = true;
        tile.connections.right = false;
    } else if (n === 7 || n === 19) {
        tile.connections.up = true;
        tile.connections.down = false;
        tile.connections.left = false;
        tile.connections.right = true;
    } else {
        tile.connections.up = false;
        tile.connections.down = false;
        tile.connections.left = false;
        tile.connections.right = false;  
    }
}

function CalculateNewTileTypeLeftClick(n) {
    switch (n) {
        case 0:
            return 2;
        case 1:
            return 1;
        case 2:
            return 3;
        case 3:
            return 4;
        case 4:
            return 5;
        case 5:
            return 6;
        case 6:
            return 7;
        case 7:
            return 2;
        case 8:
            return 10;
        case 9:
            return 11;
        case 10:
            return 10;
        case 11:
            return 11;
        case 12:
            return 16;
        case 13:
            return 17;
        case 14:
            return 18;
        case 15:
            return 19;
        case 16:
            return 16;
        case 17:
            return 17;
        case 18:
            return 18;
        case 19:
            return 19;
    }
}

function CalculateNewTileTypeRightClick(n) {
    switch (n) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 0;
        case 3:
            return 0;
        case 4:
            return 0;
        case 5:
            return 0;
        case 6:
            return 0;
        case 7:
            return 0;
        case 8:
            return 8;
        case 9:
            return 9;
        case 10:
            return 8;
        case 11:
            return 9;
        case 12:
            return 12;
        case 13:
            return 13;
        case 14:
            return 14;
        case 15:
            return 15;
        case 16:
            return 12;
        case 17:
            return 13;
        case 18:
            return 14;
        case 19:
            return 15;
    }
}