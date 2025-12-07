export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct answer (0-3)
    explanation?: string;
}

export interface QuizData {
    questions: QuizQuestion[];
    topic: string;
    difficulty: string;
}

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateQuiz(
    topics: string[],
    difficulty: 'easy' | 'medium' | 'hard'
): Promise<QuizData> {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
    }

    const topicsText = topics.join(', ');
    const prompt = `Create a 10-question multiple choice quiz on the following topics: ${topicsText}. Difficulty level: ${difficulty}.

CRITICAL REQUIREMENTS:
- Each question must have exactly 4 answer options (A, B, C, D)
- Only ONE correct answer per question - ensure the correctAnswer index (0-3) matches the actual correct option
- For math questions: Double-check all calculations. Verify the correct answer is actually correct.
- Questions should be appropriate for ${difficulty} difficulty level
- Include a brief explanation for each correct answer that shows why it's correct
- The correctAnswer must be the index (0, 1, 2, or 3) of the CORRECT option in the options array
- Format the response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

IMPORTANT: For math questions, verify your calculations. The correctAnswer index MUST point to the mathematically correct option.

Return ONLY valid JSON, no additional text or markdown formatting.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini', // Using mini for cost efficiency
                messages: [
                    {
                        role: 'system',
                        content: 'You are an accurate quiz generator. Always return valid JSON only, no markdown, no code blocks. For math questions, double-check all calculations before marking the correct answer. Ensure the correctAnswer index (0-3) always points to the actually correct option.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Parse JSON response
        let quizData: { questions: QuizQuestion[] };
        try {
            // Remove markdown code blocks if present
            const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            quizData = JSON.parse(cleanedContent);
        } catch (parseError) {
            throw new Error('Failed to parse quiz response. Please try again.');
        }

        // Validate structure
        if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length !== 10) {
            throw new Error('Invalid quiz format. Expected 10 questions.');
        }

        // Validate each question
        for (const q of quizData.questions) {
            if (!q.question || !q.options || q.options.length !== 4 || typeof q.correctAnswer !== 'number') {
                throw new Error('Invalid question format.');
            }
            // Validate correctAnswer is a valid index (0-3)
            if (q.correctAnswer < 0 || q.correctAnswer > 3 || !Number.isInteger(q.correctAnswer)) {
                throw new Error(`Invalid correctAnswer index: ${q.correctAnswer}. Must be 0, 1, 2, or 3.`);
            }
        }

        return {
            questions: quizData.questions,
            topic: topicsText,
            difficulty
        };
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Failed to generate quiz. Please try again.');
    }
}

