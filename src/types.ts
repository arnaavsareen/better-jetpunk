export interface Country {
    name: string;
    code: string;
    acceptedNames: string[];
}

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface GameState {
    status: GameStatus;
    score: number;
    timeLeft: number;
    guessedCountries: string[]; // Stores codes of guessed countries
}
