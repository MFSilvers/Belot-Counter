let teamCount = 2;
let teamNames = [];
let boltCounts = [0, 0, 0];
let rounds = [];
let currentRoundIndex = 0;
let editingRoundIndex = null;

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('slide-out');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

function selectTeamCount(count) {
    teamCount = count;
    const team3InputGroup = document.getElementById('team3InputGroup');
    const team3NameInput = document.getElementById('team3Name');
    
    if (count === 3) {
        team3InputGroup.style.display = 'block';
        team3NameInput.required = true;
    } else {
        team3InputGroup.style.display = 'none';
        team3NameInput.required = false;
        team3NameInput.value = '';
    }
    
    showScreen('nameInput');
}

function startGame() {
    const team1Name = document.getElementById('team1Name').value.trim();
    const team2Name = document.getElementById('team2Name').value.trim();
    const team3Name = document.getElementById('team3Name').value.trim();
    
    if (!team1Name || !team2Name) {
        showToast('Inserisci almeno i nomi delle prime due squadre', 'error');
        return;
    }
    
    if (teamCount === 3 && !team3Name) {
        showToast('Inserisci il nome della terza squadra', 'error');
        return;
    }
    
    teamNames = [team1Name, team2Name];
    if (teamCount === 3) {
        teamNames.push(team3Name);
    }
    
    boltCounts = [0, 0, 0];
    rounds = [];
    currentRoundIndex = 0;
    
    setupGameScreen();
    showScreen('gameScreen');
    updateScoreInputs();
    updateBoltCounts();
}

function setupGameScreen() {
    document.getElementById('totalName1').textContent = teamNames[0];
    document.getElementById('totalName2').textContent = teamNames[1];
    document.getElementById('thTeam1').textContent = teamNames[0];
    document.getElementById('thTeam2').textContent = teamNames[1];
    
    if (teamCount === 3) {
        document.getElementById('totalName3').textContent = teamNames[2];
        document.getElementById('thTeam3').textContent = teamNames[2];
        document.getElementById('total3').style.display = 'flex';
        document.getElementById('thTeam3').style.display = 'table-cell';
    } else {
        document.getElementById('total3').style.display = 'none';
        document.getElementById('thTeam3').style.display = 'none';
    }
    
    updateTotals();
}

function updateScoreInputs() {
    const scoreInputsDiv = document.getElementById('scoreInputs');
    scoreInputsDiv.innerHTML = '';
    
    const gameValueGroup = document.createElement('div');
    gameValueGroup.className = 'input-group';
    gameValueGroup.innerHTML = `
        <label for="gameValue">Valore Gioco</label>
        <input type="number" id="gameValue" placeholder="Punti del round" min="1" required>
    `;
    scoreInputsDiv.appendChild(gameValueGroup);
    
    const playerSelectGroup = document.createElement('div');
    playerSelectGroup.className = 'input-group';
    let selectOptions = '';
    for (let i = 0; i < teamCount; i++) {
        selectOptions += `<option value="${i}">${teamNames[i]}</option>`;
    }
    playerSelectGroup.innerHTML = `
        <label for="playerSelect">Chi ha giocato questo round?</label>
        <select id="playerSelect" class="score-input" required onchange="updateOtherScoresInputs()">
            <option value="">Seleziona squadra...</option>
            ${selectOptions}
        </select>
    `;
    scoreInputsDiv.appendChild(playerSelectGroup);
    
    if (teamCount === 2) {
        const otherScoreGroup = document.createElement('div');
        otherScoreGroup.className = 'input-group';
        otherScoreGroup.innerHTML = `
            <label for="otherScore">Punteggio dell'altra squadra</label>
            <input type="number" id="otherScore" placeholder="Punti dell'altra squadra" min="0" class="score-input" required>
        `;
        scoreInputsDiv.appendChild(otherScoreGroup);
    } else {
        const otherScoresGroup = document.createElement('div');
        otherScoresGroup.id = 'otherScoresGroup';
        otherScoresGroup.style.display = 'none';
        otherScoresGroup.innerHTML = `
            <div class="input-group">
                <label id="otherScore1Label">Punteggio</label>
                <input type="number" id="otherScore1" placeholder="Punti" min="0" class="score-input" required>
            </div>
            <div class="input-group">
                <label id="otherScore2Label">Punteggio</label>
                <input type="number" id="otherScore2" placeholder="Punti" min="0" class="score-input" required>
            </div>
        `;
        scoreInputsDiv.appendChild(otherScoresGroup);
    }
}

function updateOtherScoresInputs() {
    if (teamCount !== 3) return;
    
    const playerSelect = document.getElementById('playerSelect');
    const otherScoresGroup = document.getElementById('otherScoresGroup');
    const otherScore1Label = document.getElementById('otherScore1Label');
    const otherScore2Label = document.getElementById('otherScore2Label');
    
    if (playerSelect.value === '') {
        otherScoresGroup.style.display = 'none';
        return;
    }
    
    const playerIndex = parseInt(playerSelect.value);
    const otherIndices = [0, 1, 2].filter(i => i !== playerIndex);
    
    otherScore1Label.textContent = `Punteggio ${teamNames[otherIndices[0]]}`;
    otherScore2Label.textContent = `Punteggio ${teamNames[otherIndices[1]]}`;
    otherScoresGroup.style.display = 'block';
}

function quickAction(teamIndex, value) {
    if (teamIndex === 0) {
        const input = document.getElementById('scoreTeam1');
        const currentValue = parseInt(input.value) || 0;
        input.value = Math.max(0, currentValue + value);
    } else if (teamIndex === 1) {
        const input = document.getElementById('scoreTeam2');
        const currentValue = parseInt(input.value) || 0;
        input.value = Math.max(0, currentValue + value);
    }
}

function addBolt(teamIndex) {
    boltCounts[teamIndex]++;
    if (boltCounts[teamIndex] >= 3) {
        applyBoltPenalty(teamIndex);
        boltCounts[teamIndex] = 0;
    }
    updateBoltCounts();
}

function applyBoltPenalty(teamIndex) {
    const penaltyRound = {
        index: currentRoundIndex + 1,
        gameValue: 0,
        scores: [0, 0, 0],
        isBoltPenalty: true,
        penaltyTeam: teamIndex
    };
    
    penaltyRound.scores[teamIndex] = -10;
    
    if (teamCount === 2) {
        penaltyRound.scores = [penaltyRound.scores[0], penaltyRound.scores[1]];
    }
    
    rounds.push(penaltyRound);
    currentRoundIndex++;
    
    renderRounds();
    updateTotals();
    checkGameEnd();
}

function updateBoltCounts() {
    for (let i = 0; i < teamCount; i++) {
        const boltElement = document.getElementById(`boltCount${i + 1}`);
        if (boltElement) {
            boltElement.textContent = `🔩: ${boltCounts[i]}`;
        }
    }
}

function addRound() {
    const gameValue = parseInt(document.getElementById('gameValue').value);
    if (!gameValue || gameValue < 1) {
        showToast('Inserisci un valore valido per il gioco', 'error');
        return;
    }
    
    const playerSelect = document.getElementById('playerSelect');
    const playerIndex = parseInt(playerSelect.value);
    
    if (playerSelect.value === '' || isNaN(playerIndex)) {
        showToast('Seleziona chi ha giocato questo round', 'error');
        return;
    }
    
    const scores = [0, 0, 0];
    let boltAssigned = false;
    
    if (teamCount === 2) {
        const otherScoreInput = document.getElementById('otherScore').value;
        const otherScore = otherScoreInput === '' ? 0 : parseInt(otherScoreInput) || 0;
        
        if (otherScore < 0 || otherScore > gameValue) {
            showToast('Il punteggio deve essere tra 0 e il valore del gioco', 'error');
            return;
        }
        
        const otherTeamIndex = 1 - playerIndex;
        const playerScore = gameValue - otherScore;
        
        // Bolt se il giocatore non fa almeno pareggio (deve essere >= otherScore)
        if (playerScore < otherScore) {
            boltAssigned = true;
            boltCounts[playerIndex]++;
            if (boltCounts[playerIndex] >= 3) {
                applyBoltPenalty(playerIndex);
                boltCounts[playerIndex] = 0;
            }
            scores[playerIndex] = 0;
            scores[otherTeamIndex] = gameValue;
        } else {
            scores[playerIndex] = playerScore;
            scores[otherTeamIndex] = otherScore;
        }
        
        scores.pop();
    } else {
        const otherScore1Input = document.getElementById('otherScore1').value;
        const otherScore2Input = document.getElementById('otherScore2').value;
        const otherScore1 = otherScore1Input === '' ? 0 : parseInt(otherScore1Input) || 0;
        const otherScore2 = otherScore2Input === '' ? 0 : parseInt(otherScore2Input) || 0;
        
        if (otherScore1 < 0 || otherScore2 < 0) {
            showToast('I punteggi non possono essere negativi', 'error');
            return;
        }
        
        const otherIndices = [0, 1, 2].filter(i => i !== playerIndex);
        const playerScore = gameValue - otherScore1 - otherScore2;
        
        if (playerScore < 0) {
            showToast('La somma dei punteggi non può superare il valore del gioco', 'error');
            return;
        }
        
        // Bolt se il giocatore non fa almeno pareggio con ENTRAMBI gli altri (deve essere >= a entrambi separatamente)
        if (playerScore < otherScore1 || playerScore < otherScore2) {
            boltAssigned = true;
            boltCounts[playerIndex]++;
            if (boltCounts[playerIndex] >= 3) {
                applyBoltPenalty(playerIndex);
                boltCounts[playerIndex] = 0;
            }
            
            scores[playerIndex] = 0;
            
            // Gli altri mantengono i loro punteggi, i punti del giocatore con bolt vanno a chi ha fatto di più
            if (otherScore1 > otherScore2) {
                scores[otherIndices[0]] = otherScore1 + playerScore;
                scores[otherIndices[1]] = otherScore2;
            } else if (otherScore2 > otherScore1) {
                scores[otherIndices[0]] = otherScore1;
                scores[otherIndices[1]] = otherScore2 + playerScore;
            } else {
                // Se pari, dividi i punti del giocatore con bolt
                scores[otherIndices[0]] = otherScore1 + Math.floor(playerScore / 2);
                scores[otherIndices[1]] = otherScore2 + Math.ceil(playerScore / 2);
            }
        } else {
            scores[playerIndex] = playerScore;
            scores[otherIndices[0]] = otherScore1;
            scores[otherIndices[1]] = otherScore2;
        }
    }
    
    const round = {
        index: currentRoundIndex + 1,
        gameValue: gameValue,
        scores: scores,
        playerIndex: playerIndex,
        boltAssigned: boltAssigned
    };
    
    rounds.push(round);
    currentRoundIndex++;
    
    renderRounds();
    updateTotals();
    updateBoltCounts();
    
    document.getElementById('gameValue').value = '';
    document.getElementById('playerSelect').value = '';
    if (teamCount === 2) {
        document.getElementById('otherScore').value = '';
    } else {
        document.getElementById('otherScore1').value = '';
        document.getElementById('otherScore2').value = '';
        const otherScoresGroup = document.getElementById('otherScoresGroup');
        if (otherScoresGroup) {
            otherScoresGroup.style.display = 'none';
        }
    }
    
    checkGameEnd();
}

function renderRounds() {
    const tbody = document.getElementById('scoreTableBody');
    tbody.innerHTML = '';
    
    rounds.forEach((round, index) => {
        const row = document.createElement('tr');
        const isBoltPenalty = round.isBoltPenalty || false;
        const isPenaltyRound = round.isPenaltyRound || false;
        
        if (isPenaltyRound) {
            row.innerHTML = `
                <td>${round.index}</td>
                <td>${round.scores[0]}</td>
                <td>${round.scores[1]}</td>
                ${teamCount === 3 ? `<td>${round.scores[2]}</td>` : ''}
                <td>${round.gameValue}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteRound(${index})">X</button>
                </td>
            `;
        } else if (isBoltPenalty) {
            const isEditing = editingRoundIndex === index;
            const boltScore0 = round.scores[0] !== undefined && round.scores[0] !== null ? round.scores[0] : 0;
            const boltScore1 = round.scores[1] !== undefined && round.scores[1] !== null ? round.scores[1] : 0;
            const boltScore2 = teamCount === 3 && round.scores[2] !== undefined && round.scores[2] !== null ? round.scores[2] : 0;
            
            row.innerHTML = `
                <td>${round.index} (🔩)</td>
                <td>
                    <input type="text" value="${boltScore0}" 
                           class="score-edit" ${isEditing ? '' : 'readonly'}>
                </td>
                <td>
                    <input type="text" value="${boltScore1}" 
                           class="score-edit" ${isEditing ? '' : 'readonly'}>
                </td>
                ${teamCount === 3 ? `
                <td>
                    <input type="text" value="${boltScore2}" 
                           class="score-edit" ${isEditing ? '' : 'readonly'}>
                </td>
                ` : ''}
                <td>-</td>
                <td>
                    ${isEditing ? `
                        <button class="btn btn-success btn-small" onclick="saveRoundEdit(${index})">Salva</button>
                        <button class="btn btn-secondary btn-small" onclick="cancelRoundEdit()">Annulla</button>
                    ` : `
                        <button class="btn btn-primary btn-small" onclick="editRound(${index})">✏️</button>
                        <button class="btn btn-danger btn-small" onclick="deleteRound(${index})">X</button>
                    `}
                </td>
            `;
        } else {
            const playerInfo = round.playerIndex !== undefined ? 
                `<span class="player-info">${teamNames[round.playerIndex]}</span>` : '';
            const boltInfo = round.boltAssigned ? '<span class="bolt-info">🔩 Bolt</span>' : '';
            const isEditing = editingRoundIndex === index;
            
            const score0 = round.scores[0] !== undefined && round.scores[0] !== null ? round.scores[0] : 0;
            const score1 = round.scores[1] !== undefined && round.scores[1] !== null ? round.scores[1] : 0;
            const score2 = teamCount === 3 && round.scores[2] !== undefined && round.scores[2] !== null ? round.scores[2] : 0;
            const gameVal = round.gameValue !== undefined && round.gameValue !== null ? round.gameValue : 0;
            
            row.innerHTML = `
                <td>${round.index}${playerInfo ? ' ' + playerInfo : ''}${boltInfo ? ' ' + boltInfo : ''}</td>
                <td>
                    <input type="text" value="${score0}" 
                           class="score-edit" ${isEditing ? '' : 'readonly'}>
                </td>
                <td>
                    <input type="text" value="${score1}" 
                           class="score-edit" ${isEditing ? '' : 'readonly'}>
                </td>
                ${teamCount === 3 ? `
                <td>
                    <input type="text" value="${score2}" 
                           class="score-edit" ${isEditing ? '' : 'readonly'}>
                </td>
                ` : ''}
                <td>
                    <input type="text" value="${gameVal}" 
                           class="score-edit" ${isEditing ? '' : 'readonly'}>
                </td>
                <td class="actions-cell">
                    ${isEditing ? `
                        <div class="action-buttons">
                            <button class="btn btn-success btn-small" onclick="saveRoundEdit(${index})">Salva</button>
                            <button class="btn btn-secondary btn-small" onclick="cancelRoundEdit()">Annulla</button>
                        </div>
                    ` : `
                        <div class="action-buttons">
                            <button class="btn btn-primary btn-small" onclick="editRound(${index})">✏️</button>
                            <button class="btn btn-danger btn-small" onclick="deleteRound(${index})">X</button>
                        </div>
                    `}
                </td>
            `;
        }
        
        tbody.appendChild(row);
    });
}


function editRound(roundIndex) {
    editingRoundIndex = roundIndex;
    renderRounds();
}

function cancelRoundEdit() {
    editingRoundIndex = null;
    renderRounds();
}

function saveRoundEdit(roundIndex) {
    const round = rounds[roundIndex];
    const row = document.querySelector(`#scoreTableBody tr:nth-child(${roundIndex + 1})`);
    
    if (!row) return;
    
    const inputs = row.querySelectorAll('.score-edit');
    const newScores = [];
    let newGameValue = round.gameValue;
    
    
    if (round.isBoltPenalty) {
        for (let i = 0; i < teamCount; i++) {
            newScores.push(parseInt(inputs[i].value) || 0);
        }
        round.scores = newScores;
        editingRoundIndex = null;
        renderRounds();
        updateTotals();
        checkGameEnd();
        showToast('Round modificato', 'success');
        return;
    }
    
    if (round.isPenaltyRound) {
        editingRoundIndex = null;
        renderRounds();
        return;
    }
    
    for (let i = 0; i < teamCount; i++) {
        newScores.push(parseInt(inputs[i].value) || 0);
    }
    newGameValue = parseInt(inputs[teamCount].value) || round.gameValue;
    
    const totalScores = newScores.reduce((a, b) => a + b, 0);
    
    if (totalScores > newGameValue) {
        showToast('Il punteggio totale non può superare il valore del gioco', 'error');
        renderRounds();
        return;
    }
    
    if (teamCount === 2) {
        round.scores = newScores;
        round.gameValue = newGameValue;
        
        const playerScore = newScores[round.playerIndex];
        const otherScore = newScores[1 - round.playerIndex];
        
        // Bolt se il giocatore non fa almeno pareggio (deve essere >= otherScore)
        if (playerScore < otherScore && !round.boltAssigned) {
            round.boltAssigned = true;
            boltCounts[round.playerIndex]++;
            if (boltCounts[round.playerIndex] >= 3) {
                applyBoltPenalty(round.playerIndex);
                boltCounts[round.playerIndex] = 0;
            }
            round.scores[round.playerIndex] = 0;
            round.scores[1 - round.playerIndex] = newGameValue;
        } else if (playerScore >= otherScore && round.boltAssigned) {
            round.boltAssigned = false;
            if (boltCounts[round.playerIndex] > 0) {
                boltCounts[round.playerIndex]--;
            }
        }
    } else {
        const playerScore = newScores[round.playerIndex];
        const otherIndices = [0, 1, 2].filter(i => i !== round.playerIndex);
        const otherScore1 = newScores[otherIndices[0]];
        const otherScore2 = newScores[otherIndices[1]];
        
        // Bolt se il giocatore non fa almeno pareggio con ENTRAMBI gli altri (deve essere >= a entrambi separatamente)
        if ((playerScore < otherScore1 || playerScore < otherScore2) && !round.boltAssigned) {
            round.boltAssigned = true;
            boltCounts[round.playerIndex]++;
            if (boltCounts[round.playerIndex] >= 3) {
                applyBoltPenalty(round.playerIndex);
                boltCounts[round.playerIndex] = 0;
            }
            round.scores[round.playerIndex] = 0;
            
            // Gli altri mantengono i loro punteggi, i punti del giocatore con bolt vanno a chi ha fatto di più
            if (otherScore1 > otherScore2) {
                round.scores[otherIndices[0]] = otherScore1 + playerScore;
                round.scores[otherIndices[1]] = otherScore2;
            } else if (otherScore2 > otherScore1) {
                round.scores[otherIndices[0]] = otherScore1;
                round.scores[otherIndices[1]] = otherScore2 + playerScore;
            } else {
                // Se pari, dividi i punti del giocatore con bolt
                round.scores[otherIndices[0]] = otherScore1 + Math.floor(playerScore / 2);
                round.scores[otherIndices[1]] = otherScore2 + Math.ceil(playerScore / 2);
            }
        } else if (playerScore >= otherScore1 && playerScore >= otherScore2 && round.boltAssigned) {
            round.boltAssigned = false;
            if (boltCounts[round.playerIndex] > 0) {
                boltCounts[round.playerIndex]--;
            }
            round.scores = newScores;
        } else {
            round.scores = newScores;
        }
        
        round.gameValue = newGameValue;
    }
    
    editingRoundIndex = null;
    renderRounds();
    updateTotals();
    updateBoltCounts();
    checkGameEnd();
    showToast('Round modificato', 'success');
}


function deleteRound(roundIndex) {
    showToast('Round eliminato', 'success');
    rounds.splice(roundIndex, 1);
    rounds.forEach((round, index) => {
        round.index = index + 1;
    });
    currentRoundIndex = rounds.length;
    renderRounds();
    updateTotals();
    checkGameEnd();
}

function addPenaltyRound(teamIndex) {
    const penaltyRound = {
        index: currentRoundIndex + 1,
        gameValue: '-',
        scores: teamCount === 2 ? ['-', '-'] : ['-', '-', '-'],
        isPenaltyRound: true,
        penaltyTeam: teamIndex
    };
    
    penaltyRound.scores[teamIndex] = -10;
    
    rounds.push(penaltyRound);
    currentRoundIndex++;
    
    renderRounds();
    updateTotals();
    checkGameEnd();
}

function updateTotals() {
    const totals = [0, 0, 0];
    
    rounds.forEach(round => {
        round.scores.forEach((score, index) => {
            if (typeof score === 'number') {
                totals[index] += score;
            }
        });
    });
    
    document.getElementById('totalScore1').textContent = totals[0];
    document.getElementById('totalScore2').textContent = totals[1];
    
    if (teamCount === 3) {
        document.getElementById('totalScore3').textContent = totals[2];
    }
    
    updateTotalColors(totals);
}

function updateTotalColors(totals) {
    const totalBoxes = [
        document.getElementById('total1'),
        document.getElementById('total2'),
        document.getElementById('total3')
    ];
    
    totalBoxes.forEach((box, index) => {
        if (box && totals[index] >= 101) {
            box.classList.add('winner');
        } else if (box) {
            box.classList.remove('winner');
        }
    });
}

function checkGameEnd() {
    const totals = [0, 0, 0];
    
    rounds.forEach(round => {
        round.scores.forEach((score, index) => {
            totals[index] += score;
        });
    });
    
    const winnerIndex = totals.findIndex(total => total >= 101);
    
    if (winnerIndex !== -1) {
        const winnerMessage = document.getElementById('winnerMessage');
        const winnerText = document.getElementById('winnerText');
        winnerText.textContent = `Vince la squadra ${teamNames[winnerIndex]}!`;
        winnerMessage.style.display = 'block';
        winnerMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        document.getElementById('winnerMessage').style.display = 'none';
    }
}

function goBackToTeamSelection() {
    showScreen('teamSelection');
    resetGame();
}

function goBackToMain() {
    // Reset all game data
    teamCount = 2;
    teamNames = [];
    boltCounts = [0, 0, 0];
    rounds = [];
    currentRoundIndex = 0;
    editingRoundIndex = null;
    
    // Clear all input fields
    document.getElementById('team1Name').value = '';
    document.getElementById('team2Name').value = '';
    document.getElementById('team3Name').value = '';
    document.getElementById('team3InputGroup').style.display = 'none';
    
    // Hide winner message if visible
    document.getElementById('winnerMessage').style.display = 'none';
    
    // Go back to main screen
    showScreen('teamSelection');
    teamCount = 2;
    teamNames = [];
    boltCounts = [0, 0, 0];
    rounds = [];
    currentRoundIndex = 0;
    
    document.getElementById('team1Name').value = '';
    document.getElementById('team2Name').value = '';
    document.getElementById('team3Name').value = '';
    document.getElementById('team3InputGroup').style.display = 'none';
    resetGame();
    
    showScreen('teamSelection');
    showToast('Tornato alla pagina principale', 'info');
}

function resetGame() {
    // Reset all game data
    teamCount = 2;
    teamNames = [];
    boltCounts = [0, 0, 0];
    rounds = [];
    currentRoundIndex = 0;
    editingRoundIndex = null;
    
    // Clear all input fields
    document.getElementById('team1Name').value = '';
    document.getElementById('team2Name').value = '';
    document.getElementById('team3Name').value = '';
    document.getElementById('team3InputGroup').style.display = 'none';
    
    // Hide winner message banner
    const winnerMessage = document.getElementById('winnerMessage');
    if (winnerMessage) {
        winnerMessage.style.display = 'none';
    }
    
    // Clear score table
    const tbody = document.getElementById('scoreTableBody');
    if (tbody) {
        tbody.innerHTML = '';
    }
    
    // Clear score inputs in game screen
    const scoreInputs = document.getElementById('scoreInputs');
    if (scoreInputs) {
        scoreInputs.innerHTML = '';
    }
    
    // Reset totals and remove winner class
    for (let i = 0; i < 3; i++) {
        const totalElement = document.getElementById(`totalScore${i + 1}`);
        if (totalElement) {
            totalElement.textContent = '0';
        }
        const boltElement = document.getElementById(`boltCount${i + 1}`);
        if (boltElement) {
            boltElement.textContent = '🔩: 0';
        }
        const totalBox = document.getElementById(`total${i + 1}`);
        if (totalBox) {
            totalBox.classList.remove('winner');
        }
    }
    
    // Go back to main screen
    showScreen('teamSelection');
    
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

