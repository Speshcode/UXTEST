
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const matrix = JSON.parse(fs.readFileSync('./data/matrix.json'));
const questions = JSON.parse(fs.readFileSync('./data/questions.json'));

app.get('/api/generate-test', (req, res) => {
  const test = [];
  matrix.hardSkills.concat(matrix.softSkills).forEach(comp => {
    matrix.grades.forEach(grade => {
      const qList = questions[comp][grade];
      if (qList) {
        const randomQ = qList[Math.floor(Math.random() * qList.length)];
        test.push({ competency: comp, grade, ...randomQ });
      }
    });
  });
  res.json(test.sort(() => Math.random() - 0.5));
});

app.post('/api/calculate', (req, res) => {
  const answers = req.body;
  const gradeWeights = matrix.gradeWeights;
  const categoryScore = { hard: 0, soft: 0 };

  matrix.hardSkills.forEach(c => {
    const scores = matrix.grades.map(g => (answers[c]?.[g] ? gradeWeights[g] : 0));
    categoryScore.hard += scores.reduce((a, b) => a + b, 0) / scores.length;
  });
  matrix.softSkills.forEach(c => {
    const scores = matrix.grades.map(g => (answers[c]?.[g] ? gradeWeights[g] : 0));
    categoryScore.soft += scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  const hardTotal = matrix.hardSkills.length * 5;
  const softTotal = matrix.softSkills.length * 5;

  const hardScore = Math.round(categoryScore.hard);
  const softScore = Math.round(categoryScore.soft);

  const getGrade = s => s >= 68 ? 'Главный дизайнер' : s >= 51 ? 'Ведущий дизайнер' : s >= 34 ? 'Дизайнер' : s >= 17 ? 'Младший дизайнер' : 'Стажёр';

  res.json({
    hardSkills: { score: hardScore, total: hardTotal, grade: getGrade(hardScore) },
    softSkills: { score: softScore, total: softTotal, grade: getGrade(softScore) }
  });
});

app.listen(5000, () => console.log('API on port 5000'));
