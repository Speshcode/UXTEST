import React, { useEffect, useState } from 'react';
export default function App() {
const [test, setTest] = useState([]);
const [results, setResults] = useState(null);
const [answers, setAnswers] = useState({});
useEffect(() => { fetch('http://localhost:5000/api/generate-test').then(r=>r.json()).then(setTest); }, []);
if (results) return <pre>{JSON.stringify(results,null,2)}</pre>;
if (!test.length) return 'Загрузка...';
return <div>{test.map((q,i)=><div key={i}><h3>{q.competency} ({q.grade})</h3><p>{q.text}</p>{q.options.map(o=><button key={o} onClick={()=>{ setAnswers({...answers,[q.competency]:{...(answers[q.competency]||{}),[q.grade]:o===q.answer}}); if(i===test.length-1)fetch('http://localhost:5000/api/calculate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(answers)}).then(r=>r.json()).then(setResults);}}>{o}</button>)}</div>)}</div>;
}