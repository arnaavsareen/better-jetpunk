import React, { useState, useCallback } from 'react';
import { generateQuiz } from '../../services/quizService';
import type { QuizData } from '../../services/quizService';
import '../../styles/generalknowledge.css';

interface GeneralKnowledgeProps {
    onBack: () => void;
}

type GamePhase = 'setup' | 'loading' | 'playing' | 'results';

const AVAILABLE_TOPICS = [
    'History',
    'Science',
    'Geography',
    'Literature',
    'Sports',
    'Movies',
    'Music',
    'Technology',
    'Art',
    'Food',
    'Nature',
    'Mathematics',
    'Philosophy',
    'Politics',
    'Economics'
];

const DIFFICULTY_LEVELS = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
] as const;

export const GeneralKnowledge: React.FC<GeneralKnowledgeProps> = ({ onBack }) => {
    const [phase, setPhase] = useState<GamePhase>('setup');
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const toggleTopic = useCallback((topic: string) => {
        setSelectedTopics(prev => {
            if (prev.includes(topic)) {
                return prev.filter(t => t !== topic);
            } else {
                return [...prev, topic];
            }
        });
    }, []);

    const handleStartQuiz = useCallback(async () => {
        if (selectedTopics.length === 0) {
            setError('Please select at least one topic');
            return;
        }

        setError(null);
        setPhase('loading');
        setLoadingProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + 10;
            });
        }, 200);

        try {
            const quiz = await generateQuiz(selectedTopics, selectedDifficulty);
            clearInterval(progressInterval);
            setLoadingProgress(100);
            
            setTimeout(() => {
                setQuizData(quiz);
                setSelectedAnswers(new Array(10).fill(-1));
                setCurrentQuestionIndex(0);
                setShowResults(false);
                setPhase('playing');
            }, 500);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.');
            setPhase('setup');
        }
    }, [selectedTopics, selectedDifficulty]);

    const handleAnswerSelect = useCallback((answerIndex: number) => {
        if (showResults) return;
        
        setSelectedAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentQuestionIndex] = answerIndex;
            return newAnswers;
        });
    }, [currentQuestionIndex, showResults]);

    const handleNextQuestion = useCallback(() => {
        if (currentQuestionIndex < 9) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setShowResults(true);
            setPhase('results');
        }
    }, [currentQuestionIndex]);

    const handlePreviousQuestion = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            setShowResults(false);
        }
    }, [currentQuestionIndex]);

    const handleRestart = useCallback(() => {
        setPhase('setup');
        setQuizData(null);
        setCurrentQuestionIndex(0);
        setSelectedAnswers([]);
        setShowResults(false);
        setError(null);
    }, []);

    const getScore = useCallback(() => {
        if (!quizData) return 0;
        let correct = 0;
        quizData.questions.forEach((q, i) => {
            if (selectedAnswers[i] === q.correctAnswer) {
                correct++;
            }
        });
        return correct;
    }, [quizData, selectedAnswers]);


    // Setup Phase
    if (phase === 'setup') {
        return (
            <div className="gk-container">
                <header className="gk-header">
                    <button className="btn-back" onClick={onBack}>
                        ← Back
                    </button>
                    <h1>General Knowledge Quiz</h1>
                    <div className="gk-subtitle">Choose topics and difficulty</div>
                </header>

                <main className="gk-setup">
                    <div className="gk-setup-section">
                        <h2 className="gk-section-title">Select Topics</h2>
                        <p className="gk-section-description">Choose one or more topics for your quiz</p>
                        <div className="gk-topics-grid">
                            {AVAILABLE_TOPICS.map(topic => (
                                <button
                                    key={topic}
                                    className={`gk-topic-chip ${selectedTopics.includes(topic) ? 'selected' : ''}`}
                                    onClick={() => toggleTopic(topic)}
                                >
                                    {topic}
                                    {selectedTopics.includes(topic) && <span className="gk-check">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="gk-setup-section">
                        <h2 className="gk-section-title">Difficulty Level</h2>
                        <p className="gk-section-description">Choose how challenging you want the questions to be</p>
                        <div className="gk-difficulty-grid">
                            {DIFFICULTY_LEVELS.map(level => (
                                <button
                                    key={level.value}
                                    className={`gk-difficulty-card ${selectedDifficulty === level.value ? 'selected' : ''}`}
                                    onClick={() => setSelectedDifficulty(level.value)}
                                >
                                    <span className="gk-difficulty-label">{level.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="gk-error">
                            {error}
                        </div>
                    )}

                    <button
                        className="gk-start-button"
                        onClick={handleStartQuiz}
                        disabled={selectedTopics.length === 0}
                    >
                        Start Quiz
                    </button>
                </main>
            </div>
        );
    }

    // Loading Phase
    if (phase === 'loading') {
        return (
            <div className="gk-container">
                <div className="gk-loading">
                    <div className="gk-loading-icon">🧠</div>
                    <h2>Generating Your Quiz...</h2>
                    <p>Our AI is crafting 10 amazing questions for you!</p>
                    <div className="gk-progress-container">
                        <div className="gk-progress-bar" style={{ width: `${loadingProgress}%` }} />
                    </div>
                    <div className="gk-loading-text">{loadingProgress}%</div>
                </div>
            </div>
        );
    }

    // Results Phase
    if (phase === 'results') {
        const score = getScore();
        const isPerfect = score === 10;
        const isGood = score >= 7;

        return (
            <div className="gk-container">
                <div className="gk-results">
                    <div className={`gk-results-icon ${isPerfect ? 'perfect' : isGood ? 'good' : 'ok'}`}>
                        {isPerfect ? '🏆' : isGood ? '🎉' : '📚'}
                    </div>
                    <h2 className="gk-results-title">
                        {isPerfect ? 'Perfect Score!' : isGood ? 'Great Job!' : 'Nice Try!'}
                    </h2>
                    <div className="gk-results-score">
                        <span className="gk-score-number">{score}</span>
                        <span className="gk-score-total">/ 10</span>
                    </div>
                    <p className="gk-results-message">
                        {isPerfect 
                            ? 'You got every question right! Amazing work!'
                            : isGood
                            ? `You answered ${score} out of 10 questions correctly. Well done!`
                            : `You answered ${score} out of 10 questions correctly. Keep learning!`
                        }
                    </p>

                    <div className="gk-results-breakdown">
                        <h3>Question Breakdown</h3>
                        <div className="gk-breakdown-list">
                            {quizData?.questions.map((q, i) => {
                                const isCorrect = selectedAnswers[i] === q.correctAnswer;
                                const selectedIndex = selectedAnswers[i];
                                const selectedAnswer = selectedIndex !== -1 ? q.options[selectedIndex] : 'Not answered';
                                const correctAnswer = q.options[q.correctAnswer];
                                
                                return (
                                    <div key={i} className={`gk-breakdown-question ${isCorrect ? 'correct' : 'incorrect'}`}>
                                        <div className="gk-breakdown-header">
                                            <span className="gk-breakdown-number">Question {i + 1}</span>
                                            <span className={`gk-breakdown-status ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                            </span>
                                        </div>
                                        <div className="gk-breakdown-question-text">{q.question}</div>
                                        <div className="gk-breakdown-answers">
                                            <div className={`gk-breakdown-answer ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                <span className="gk-breakdown-answer-label">Your answer:</span>
                                                <span className="gk-breakdown-answer-text">
                                                    {selectedIndex !== -1 ? `${String.fromCharCode(65 + selectedIndex)}. ${selectedAnswer}` : 'Not answered'}
                                                </span>
                                            </div>
                                            {!isCorrect && (
                                                <div className="gk-breakdown-answer correct">
                                                    <span className="gk-breakdown-answer-label">Correct answer:</span>
                                                    <span className="gk-breakdown-answer-text">
                                                        {String.fromCharCode(65 + q.correctAnswer)}. {correctAnswer}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {q.explanation && (
                                            <div className="gk-breakdown-explanation">
                                                {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="gk-results-actions">
                        <button className="btn-play-again" onClick={handleRestart}>
                            New Quiz
                        </button>
                        <button className="btn-back-home" onClick={onBack}>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Playing Phase
    if (!quizData) return null;

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const selectedAnswer = selectedAnswers[currentQuestionIndex];
    const hasAnswered = selectedAnswer !== -1;
    const isCorrect = hasAnswered && selectedAnswer === currentQuestion.correctAnswer;
    const showExplanation = showResults && hasAnswered;

    return (
        <div className="gk-container">
            <header className="gk-header">
                <button className="btn-back" onClick={onBack}>
                    ← Back
                </button>
                <div className="gk-title-section">
                    <h1>General Knowledge</h1>
                    <div className="gk-quiz-info">
                        {quizData.topic} • {quizData.difficulty}
                    </div>
                </div>
                <div className="gk-progress-info">
                    Question {currentQuestionIndex + 1} / 10
                </div>
            </header>

            <main className="gk-main">
                <div className="gk-question-card">
                    <div className="gk-question-number">Question {currentQuestionIndex + 1}</div>
                    <h2 className="gk-question-text">{currentQuestion.question}</h2>

                    <div className="gk-options">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === index;
                            const isCorrectOption = index === currentQuestion.correctAnswer;
                            let optionClass = 'gk-option';
                            
                            if (showResults) {
                                if (isCorrectOption) {
                                    optionClass += ' correct';
                                } else if (isSelected && !isCorrectOption) {
                                    optionClass += ' incorrect';
                                }
                            } else if (isSelected) {
                                optionClass += ' selected';
                            }

                                return (
                                <button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => handleAnswerSelect(index)}
                                    disabled={showResults}
                                >
                                    <span className="gk-option-letter">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    <span className="gk-option-text">{option}</span>
                                    {!showResults && isSelected && (
                                        <span className="gk-option-selected-indicator">✓</span>
                                    )}
                                    {showResults && isCorrectOption && (
                                        <span className="gk-option-check">✓</span>
                                    )}
                                    {showResults && isSelected && !isCorrectOption && (
                                        <span className="gk-option-cross">✗</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {showExplanation && currentQuestion.explanation && (
                        <div className={`gk-explanation ${isCorrect ? 'correct' : 'incorrect'}`}>
                            <strong>{isCorrect ? 'Correct!' : 'Incorrect'}</strong>
                            <p>{currentQuestion.explanation}</p>
                        </div>
                    )}

                    <div className="gk-question-nav">
                        <button
                            className="gk-nav-button"
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                        >
                            ← Previous
                        </button>
                        <div className="gk-question-dots">
                            {quizData.questions.map((_, i) => {
                                const isAnswered = selectedAnswers[i] !== -1;
                                const isCurrent = i === currentQuestionIndex;
                                return (
                                    <div
                                        key={i}
                                        className={`gk-dot ${isCurrent ? 'current' : ''} ${isAnswered ? 'answered' : ''}`}
                                        onClick={() => {
                                            setCurrentQuestionIndex(i);
                                            setShowResults(false);
                                        }}
                                    />
                                );
                            })}
                        </div>
                        <button
                            className="gk-nav-button"
                            onClick={handleNextQuestion}
                            disabled={!hasAnswered}
                        >
                            {currentQuestionIndex === 9 ? 'See Results' : 'Next →'}
                        </button>
                    </div>
                </div>

                <div className="gk-progress-bar-container">
                    <div 
                        className="gk-progress-bar-fill" 
                        style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }}
                    />
                </div>
            </main>
        </div>
    );
};

