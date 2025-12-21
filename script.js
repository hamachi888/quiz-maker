const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const output = document.getElementById("output");

let data = [];

function addQuestion() {
  data.push({
    question: "",
    choices: ["", "", "", ""],
    answer: 0,
    explanation: ""
  });
  render();
}

function render() {
  editor.innerHTML = "";
  preview.innerHTML = "";

  data.forEach((q, i) => {
    // 作成画面
    const box = document.createElement("div");
    box.className = "question-box";
    box.innerHTML = `
      <h3>問題 ${i + 1}</h3>
      <input placeholder="問題文" value="${q.question}"
        oninput="data[${i}].question=this.value; update()">

      ${q.choices.map((c, j) => `
        <input placeholder="選択肢${j + 1}" value="${c}"
          oninput="data[${i}].choices[${j}]=this.value; update()">
      `).join("")}

      正解：
      ${[0,1,2,3].map(n => `
        <label>
          <input type="radio" name="a${i}" ${q.answer===n?"checked":""}
            onchange="data[${i}].answer=${n}">
          ${n+1}
        </label>
      `).join("")}

      <input placeholder="解説" value="${q.explanation}"
        oninput="data[${i}].explanation=this.value; update()">
    `;
    editor.appendChild(box);

    // プレビュー
    const card = document.createElement("div");
    card.className = "preview-card";
    card.innerHTML = `
      <strong>Q${i + 1}. ${q.question}</strong>
      ${q.choices.map(c => `<div class="choice">${c}</div>`).join("")}
    `;
    preview.appendChild(card);
  });

  updateOutput();
}

function update() {
  render();
}

function updateOutput() {
  output.value = `
<div id="quiz"></div>
<script>
const quizData = ${JSON.stringify(data, null, 2)};
// ← ここに前回作ったカード型UIのJSを貼る
</script>
`.trim();
}

document.getElementById("add").onclick = addQuestion;

addQuestion();
