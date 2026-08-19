        (function() {
            // === Game State ===
            const state = {
                playerScore: 0,
                computerScore: 0,
                round: 1,
                totalRounds: Infinity, // Unlimited rounds
                playerChoice: null,
                computerChoice: null,
                isPlaying: false,
                isResetting: false,
            };

            // === Choices Data ===
            const CHOICES = {
                rock: {
                    emoji: '🪨',
                    name: 'Rock',
                    beats: 'scissors',
                    color: '#ff6b6b',
                },
                paper: {
                    emoji: '📄',
                    name: 'Paper',
                    beats: 'rock',
                    color: '#4ecdc4',
                },
                scissors: {
                    emoji: '✂️',
                    name: 'Scissors',
                    beats: 'paper',
                    color: '#ffd93d',
                },
            };

            const CHOICE_KEYS = Object.keys(CHOICES);

            // === DOM Elements ===
            const playerScoreEl = document.getElementById('playerScore');
            const computerScoreEl = document.getElementById('computerScore');
            const playerScoreCard = document.getElementById('playerScoreCard');
            const computerScoreCard = document.getElementById('computerScoreCard');
            const roundNumberEl = document.getElementById('roundNumber');

            const playerChoiceDisplay = document.getElementById('playerChoiceDisplay');
            const computerChoiceDisplay = document.getElementById('computerChoiceDisplay');
            const playerChoiceIcon = document.getElementById('playerChoiceIcon');
            const playerChoiceName = document.getElementById('playerChoiceName');
            const computerChoiceIcon = document.getElementById('computerChoiceIcon');
            const computerChoiceName = document.getElementById('computerChoiceName');

            const resultBanner = document.getElementById('resultBanner');
            const choiceButtons = document.querySelectorAll('.choice-btn');
            const resetBtn = document.getElementById('resetBtn');
            const confettiContainer = document.getElementById('confettiContainer');

            // === Helper Functions ===
            function getRandomChoice() {
                const randomIndex = Math.floor(Math.random() * CHOICE_KEYS.length);
                return CHOICE_KEYS[randomIndex];
            }

            function determineWinner(playerChoice, computerChoice) {
                if (playerChoice === computerChoice) return 'tie';
                if (CHOICES[playerChoice].beats === computerChoice) return 'win';
                return 'lose';
            }

            function updateScoreDisplay() {
                playerScoreEl.textContent = state.playerScore;
                computerScoreEl.textContent = state.computerScore;
                roundNumberEl.textContent = state.round;
            }

            function updateChoiceDisplays(playerChoice, computerChoice) {
                // Player
                if (playerChoice) {
                    const pc = CHOICES[playerChoice];
                    playerChoiceIcon.textContent = pc.emoji;
                    playerChoiceName.textContent = pc.name;
                    playerChoiceDisplay.className = 'choice-display';
                    playerChoiceDisplay.classList.add(playerChoice + '-choice');
                } else {
                    playerChoiceIcon.textContent = '🤔';
                    playerChoiceName.textContent = 'Waiting...';
                    playerChoiceDisplay.className = 'choice-display';
                }

                // Computer
                if (computerChoice) {
                    const cc = CHOICES[computerChoice];
                    computerChoiceIcon.textContent = cc.emoji;
                    computerChoiceName.textContent = cc.name;
                    computerChoiceDisplay.className = 'choice-display';
                    computerChoiceDisplay.classList.add(computerChoice + '-choice');
                } else {
                    computerChoiceIcon.textContent = '💻';
                    computerChoiceName.textContent = 'Thinking...';
                    computerChoiceDisplay.className = 'choice-display';
                }
            }

            function setResultBanner(text, type) {
                resultBanner.textContent = text;
                resultBanner.className = 'result-banner';
                if (type) {
                    resultBanner.classList.add(type);
                }
                // Restart animation
                resultBanner.style.animation = 'none';
                void resultBanner.offsetWidth; // Trigger reflow
                resultBanner.style.animation = '';
            }

            function highlightScoreCard(card, shouldHighlight) {
                card.classList.remove('highlight');
                if (shouldHighlight) {
                    void card.offsetWidth;
                    card.classList.add('highlight');
                }
            }

            function setButtonsEnabled(enabled) {
                choiceButtons.forEach(btn => {
                    btn.disabled = !enabled;
                    btn.classList.remove('selected');
                });
            }

            function spawnConfetti(count = 80) {
                const colors = ['#e94560', '#533483', '#0f3460', '#ff6b6b', '#4ecdc4', '#ffd93d', '#2ecc71',
                    '#f39c12', '#fff'
                ];
                const container = confettiContainer;
                for (let i = 0; i < count; i++) {
                    const piece = document.createElement('div');
                    piece.classList.add('confetti-piece');
                    const color = colors[Math.floor(Math.random() * colors.length)];
                    const left = Math.random() * 100;
                    const size = 6 + Math.random() * 10;
                    const delay = Math.random() * 0.8;
                    const duration = 1.8 + Math.random() * 1.5;
                    const shape = Math.random() > 0.5 ? '50%' : '2px';
                    piece.style.cssText = `
                                left: ${left}%;
                                width: ${size}px;
                                height: ${size * (Math.random() > 0.5 ? 1 : 0.5)}px;
                                background: ${color};
                                border-radius: ${shape};
                                animation-delay: ${delay}s;
                                animation-duration: ${duration}s;
                                box-shadow: 0 0 6px ${color}40;
                            `;
                    container.appendChild(piece);
                    // Remove after animation
                    setTimeout(() => {
                        piece.remove();
                    }, (delay + duration) * 1000 + 100);
                }
            }

            function animateScoreChange(winner) {
                if (winner === 'win') {
                    highlightScoreCard(playerScoreCard, true);
                    spawnConfetti(60);
                } else if (winner === 'lose') {
                    highlightScoreCard(computerScoreCard, true);
                } else {
                    highlightScoreCard(playerScoreCard, false);
                    highlightScoreCard(computerScoreCard, false);
                }
            }

            function getResultMessage(winner, playerChoice, computerChoice) {
                const pName = CHOICES[playerChoice].emoji + ' ' + CHOICES[playerChoice].name;
                const cName = CHOICES[computerChoice].emoji + ' ' + CHOICES[computerChoice].name;
                switch (winner) {
                    case 'win':
                        return `🎉 ${pName} beats ${cName} — You WIN!`;
                    case 'lose':
                        return `😞 ${cName} beats ${pName} — You LOSE!`;
                    case 'tie':
                        return `🤝 ${pName} ties ${cName} — It's a DRAW!`;
                    default:
                        return 'Make your move!';
                }
            }

            // === Core Game Logic ===
            function playRound(playerChoice) {
                if (state.isPlaying || state.isResetting) return;

                state.isPlaying = true;
                state.playerChoice = playerChoice;

                // Highlight selected button
                choiceButtons.forEach(btn => {
                    if (btn.dataset.choice === playerChoice) {
                        btn.classList.add('selected');
                    } else {
                        btn.classList.remove('selected');
                    }
                });

                // Disable buttons during animation
                setButtonsEnabled(false);

                // Show player's choice immediately
                updateChoiceDisplays(playerChoice, null);
                playerChoiceDisplay.classList.add('revealing');

                setResultBanner('💻 Computer is choosing...', 'tie');

                // Computer thinks with a delay
                setTimeout(() => {
                    const computerChoice = getRandomChoice();
                    state.computerChoice = computerChoice;

                    // Reveal computer choice
                    updateChoiceDisplays(playerChoice, computerChoice);
                    computerChoiceDisplay.classList.add('revealing');

                    // Determine winner
                    const winner = determineWinner(playerChoice, computerChoice);

                    // Update scores
                    if (winner === 'win') {
                        state.playerScore++;
                    } else if (winner === 'lose') {
                        state.computerScore++;
                    }

                    // Update score display
                    updateScoreDisplay();

                    // Show result
                    const resultMessage = getResultMessage(winner, playerChoice, computerChoice);
                    setResultBanner(resultMessage, winner);

                    // Animate score cards
                    animateScoreChange(winner);

                    // Increment round
                    state.round++;

                    // Re-enable buttons after a short delay
                    setTimeout(() => {
                        state.isPlaying = false;
                        state.playerChoice = null;
                        state.computerChoice = null;
                        setButtonsEnabled(true);
                        updateChoiceDisplays(null, null);
                        updateScoreDisplay();

                        // Reset result banner to neutral after a moment
                        setTimeout(() => {
                            if (!state.isPlaying) {
                                setResultBanner('Make your move!', null);
                            }
                        }, 1200);
                    }, 800);
                }, 700);
            }

            function resetGame() {
                if (state.isResetting) return;

                state.isResetting = true;
                setButtonsEnabled(false);

                // Animate reset
                resultBanner.style.transition = 'opacity 0.3s ease';
                resultBanner.style.opacity = '0';
                playerChoiceDisplay.style.opacity = '0';
                computerChoiceDisplay.style.opacity = '0';

                setTimeout(() => {
                    // Reset state
                    state.playerScore = 0;
                    state.computerScore = 0;
                    state.round = 1;
                    state.playerChoice = null;
                    state.computerChoice = null;
                    state.isPlaying = false;
                    state.isResetting = false;

                    // Update UI
                    updateScoreDisplay();
                    updateChoiceDisplays(null, null);
                    setResultBanner('Make your move!', null);
                    setButtonsEnabled(true);

                    // Reset opacity
                    resultBanner.style.transition = '';
                    resultBanner.style.opacity = '';
                    playerChoiceDisplay.style.opacity = '';
                    computerChoiceDisplay.style.opacity = '';

                    // Clear confetti
                    confettiContainer.innerHTML = '';

                    // Remove highlights
                    playerScoreCard.classList.remove('highlight');
                    computerScoreCard.classList.remove('highlight');

                    // Reset banner animation
                    resultBanner.style.animation = 'none';
                    void resultBanner.offsetWidth;
                    resultBanner.style.animation = '';
                }, 300);
            }

            // === Keyboard Support ===
            function handleKeyboard(e) {
                if (state.isPlaying || state.isResetting) return;
                let choice = null;
                switch (e.key.toLowerCase()) {
                    case 'r':
                    case '1':
                        choice = 'rock';
                        break;
                    case 'p':
                    case '2':
                        choice = 'paper';
                        break;
                    case 's':
                    case '3':
                        choice = 'scissors';
                        break;
                    case 'escape':
                        resetGame();
                        return;
                    default:
                        return;
                }
                if (choice) {
                    e.preventDefault();
                    playRound(choice);
                }
            }

            // === Event Listeners ===
            choiceButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const choice = btn.dataset.choice;
                    playRound(choice);
                });
            });

            resetBtn.addEventListener('click', resetGame);

            document.addEventListener('keydown', handleKeyboard);

            // === Initialize ===
            function init() {
                updateScoreDisplay();
                updateChoiceDisplays(null, null);
                setResultBanner('Make your move!', null);
                setButtonsEnabled(true);

                // Add a hint about keyboard shortcuts
                const hint = document.createElement('div');
                hint.style.cssText = `
                            text-align: center;
                            margin-top: 16px;
                            font-size: 0.75rem;
                            color: #555570;
                            letter-spacing: 0.5px;
                        `;
                hint.textContent = '⌨️ Keys: [R]ock · [P]aper · [S]cissors · [Esc] Reset';
                document.querySelector('.footer-actions').after(hint);
            }

            init();

            // Clean up confetti on page hide
            window.addEventListener('beforeunload', () => {
                confettiContainer.innerHTML = '';
            });

            console.log('🪨📄✂️ Rock Paper Scissors — Enjoy the game!');
            console.log('💡 Pro tip: Use keyboard shortcuts R, P, S for quick play!');
        })();
