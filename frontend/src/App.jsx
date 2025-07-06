import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [matrixInfo, setMatrixInfo] = useState(null);

  useEffect(() => {
    // Загружаем информацию о матрице при запуске
    fetch('http://localhost:5000/api/matrix-info')
      .then(r => r.json())
      .then(data => setMatrixInfo(data))
      .catch(err => console.error('Error loading matrix info:', err));
  }, []);

  const startTest = async () => {
    if (!userName.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userName.trim()
        })
      });
      
      const data = await response.json();
      setTestData(data);
      setCurrentScreen('test');
      setCurrentQuestionIndex(0);
      setAnswers({});
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Ошибка при загрузке теста');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishTest();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/submit-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId: testData.testId,
          answers: answers
        })
      });
      
      const data = await response.json();
      setResults(data);
      setCurrentScreen('results');
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Ошибка при отправке результатов');
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setCurrentScreen('welcome');
    setTestData(null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResults(null);
    setUserName('');
  };

  const currentQuestion = testData?.questions[currentQuestionIndex];
  const progress = testData ? ((currentQuestionIndex + 1) / testData.questions.length) * 100 : 0;

  if (currentScreen === 'welcome') {
    return (
      <div className="app">
        <div className="welcome-screen">
          <div className="welcome-content">
            <h1>🎯 Тестирование компетенций дизайнера</h1>
            <p className="welcome-description">
              Пройдите тестирование для определения вашего уровня компетенций в дизайне. 
              Тест включает вопросы по всем ключевым навыкам от младшего дизайнера до руководителя направления.
            </p>
            
            {matrixInfo && (
              <div className="test-info">
                <div className="info-grid">
                  <div className="info-card">
                    <h3>Hard Skills</h3>
                    <p>{matrixInfo.hardSkillsCount} компетенций</p>
                  </div>
                  <div className="info-card">
                    <h3>Soft Skills</h3>
                    <p>{matrixInfo.softSkillsCount} компетенций</p>
                  </div>
                  <div className="info-card">
                    <h3>Вопросов в тесте</h3>
                    <p>~{matrixInfo.totalCompetencies * 5}</p>
                  </div>
                </div>
                
                <div className="grade-info">
                  <h3>Грейды оценки:</h3>
                  <div className="grades">
                    {matrixInfo.grades.map(grade => (
                      <span key={grade} className="grade-badge">{grade}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div className="start-form">
              <input
                type="text"
                placeholder="Введите ваше имя"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="name-input"
              />
              <button 
                onClick={startTest} 
                disabled={loading}
                className="start-button"
              >
                {loading ? 'Подготовка теста...' : 'Начать тестирование'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'test') {
    return (
      <div className="app">
        <div className="test-screen">
          <div className="test-header">
            <div className="test-info">
              <h2>Тестирование компетенций</h2>
              <p>Пользователь: <strong>{userName}</strong></p>
            </div>
            <div className="progress-info">
              <span>{currentQuestionIndex + 1} из {testData.questions.length}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {currentQuestion && (
            <div className="question-card">
              <div className="question-meta">
                <span className="competency-badge">{currentQuestion.competency}</span>
                <span className="grade-badge">{currentQuestion.grade}</span>
              </div>
              
              <h3 className="question-text">{currentQuestion.text}</h3>
              
              <div className="options">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${answers[currentQuestion.id] === option ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              <div className="navigation">
                <button 
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="nav-button secondary"
                >
                  ← Назад
                </button>
                
                <button 
                  onClick={nextQuestion}
                  disabled={!answers[currentQuestion.id]}
                  className="nav-button primary"
                >
                  {currentQuestionIndex === testData.questions.length - 1 ? 'Завершить тест' : 'Далее →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentScreen === 'results') {
    return (
      <div className="app">
        <div className="results-screen">
          <div className="results-header">
            <h1>🎉 Результаты тестирования</h1>
            <p>Пользователь: <strong>{userName}</strong></p>
          </div>

          <div className="results-summary">
            <div className="summary-card">
              <h2>Hard Skills</h2>
              <div className="score-circle">
                <div className="score-value">{results.hardSkills.score}</div>
                <div className="score-max">из {results.hardSkills.maxScore}</div>
              </div>
              <div className="grade-result">{results.hardSkills.grade}</div>
              <div className="percentage">{results.hardSkills.percentage}%</div>
            </div>

            <div className="summary-card">
              <h2>Soft Skills</h2>
              <div className="score-circle">
                <div className="score-value">{results.softSkills.score}</div>
                <div className="score-max">из {results.softSkills.maxScore}</div>
              </div>
              <div className="grade-result">{results.softSkills.grade}</div>
              <div className="percentage">{results.softSkills.percentage}%</div>
            </div>

            <div className="summary-card total">
              <h2>Общий результат</h2>
              <div className="score-circle">
                <div className="score-value">{results.totalScore}</div>
                <div className="score-max">из {results.totalMaxScore}</div>
              </div>
              <div className="percentage">{Math.round((results.totalScore / results.totalMaxScore) * 100)}%</div>
            </div>
          </div>

          <div className="detailed-results">
            <h3>Детальные результаты по компетенциям</h3>
            <div className="competency-grid">
              {results.detailedResults.map((item, index) => (
                <div key={index} className={`competency-item ${item.type}`}>
                  <div className="competency-name">{item.competency}</div>
                  <div className="competency-score">
                    {item.score} / {item.maxScore}
                  </div>
                  <div className="competency-bar">
                    <div 
                      className="competency-fill" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <div className="competency-percentage">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="results-actions">
            <button onClick={resetTest} className="reset-button">
              Пройти тест заново
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    </div>
  );
}

export default App;