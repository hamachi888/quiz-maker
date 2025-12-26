/**
 * タブ切り替え
 */
function openTab(name) {
  document.querySelectorAll(".tab").forEach(tab =>
    tab.classList.remove("active")
  );
  document.querySelectorAll(".page").forEach(page =>
    page.classList.remove("active")
  );

  document.querySelector(`[data-page="${name}"]`).classList.add("active");
  document.getElementById(name).classList.add("active");
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => openTab(tab.dataset.page));
});

/* =========================
   HTML書き出し用 CSS
========================= */
const EXPORT_CSS = `
.quiz {
  font-family: sans-serif;
  max-width: 700px;
  margin: auto;
}
.quiz-card {
  border: 2px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}
.choice-btn {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 6px 0;
  border-radius: 8px;
  border: none;
  background: #f2f2f2;
  cursor: pointer;
}
.choice-btn.selected {
  background: #cce5ff;
}
.choice-btn.correct {
  background: #b6f2c2;
}
.choice-btn.wrong {
  background: #f5b5b5;
}
.btn {
  margin-top: 12px;
  padding: 10px 16px;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 10px;
}
`;

/* =========================
   HTML書き出し用 JS
========================= */
const EXPORT_JS = `
let userAnswers = [];

function selectAnswer(qIndex, aIndex, btn) {
  userAnswers[qIndex] = aIndex;

  btn.parentElement.querySelectorAll(".choice-btn").forEach(b =>
    b.classList.remove("selected")
  );
  btn.classList.add("selected");
}

function gradeQuiz() {
  document.querySelectorAll(".quiz-card").forEach((card, i) => {
    const answer = card.dataset.answer;
    const buttons = card.querySelectorAll(".choice-btn");

    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx == answer) btn.classList.add("correct");
      if (idx == userAnswers[i] && idx != answer) btn.classList.add("wrong");
    });
  });
}
`;



// =====================
// クイズデータ
// =====================
let quizData = [];
let userAnswers = [];

/**
 * 問題追加
 */
function addQuestion() {
  const question = document.getElementById("question").value.trim();
  const choices = [...document.querySelectorAll(".choice")].map(c => c.value.trim());
  const answer = Number(document.getElementById("answer").value);
  const explanation = document.getElementById("explanation").value.trim();

  if (!question || choices.some(c => !c)) {
    alert("すべて入力してください");
    return;
  }

  quizData.push({ question, choices, answer, explanation });
  alert(`問題を追加しました（${quizData.length}問）`);
}

/**
 * プレビュー表示
 */
function showPreview() {
  const preview = document.getElementById("preview");
  preview.innerHTML = "";
  userAnswers = [];

  quizData.forEach((q, i) => {
    userAnswers[i] = null;

    const card = document.createElement("div");
    card.className = "quiz-card";

    card.innerHTML = `
      <h3>Q${i + 1}</h3>
      <p>${q.question}</p>
      ${q.choices.map((c, idx) => `
        <button class="choice-btn"
          onclick="selectAnswer(${i}, ${idx}, this)">
          ${c}
        </button>
      `).join("")}
    `;

    preview.appendChild(card);
  });

  if (quizData.length > 0) {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "採点する";
    btn.onclick = gradeQuiz;
    preview.appendChild(btn);
  }
}

/**
 * 回答選択
 */
function selectAnswer(qIndex, aIndex, btn) {
  userAnswers[qIndex] = aIndex;

  // 同じ問題内の選択解除
  btn.parentElement.querySelectorAll(".choice-btn")
    .forEach(b => b.classList.remove("selected"));

  btn.classList.add("selected");
}

/**
 * 採点
 */
function gradeQuiz() {
  const cards = document.querySelectorAll(".quiz-card");

  cards.forEach((card, i) => {
    const buttons = card.querySelectorAll(".choice-btn");

    buttons.forEach((btn, idx) => {
      btn.disabled = true;

      if (idx === quizData[i].answer) {
        btn.classList.add("correct");
      } else if (idx === userAnswers[i]) {
        btn.classList.add("wrong");
      }
    });

    // 解説ボタン
    const expBtn = document.createElement("button");
    expBtn.className = "btn secondary";
    expBtn.textContent = "解説を見る";
    expBtn.onclick = () => showExplanation(quizData[i].explanation);

    card.appendChild(expBtn);
  });
}

/**
 * 解説モーダル
 */
function showExplanation(text) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <p>${text}</p>
      <button class="btn" onclick="this.closest('.modal').remove()">閉じる</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = "flex";
}

/**
 * HTML書き出し（WordPress用）
 */
function exportHTML() {
  let html = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>クイズ</title>
<style>
${EXPORT_CSS}
</style>
</head>
<body>

<div class="quiz">
`;

  quizData.forEach((q, i) => {
    html += `
  <div class="quiz-card" data-answer="${q.answer}">
    <h3>Q${i + 1}</h3>
    <p>${q.question}</p>
    ${q.choices.map((c, idx) => `
      <button class="choice-btn" onclick="selectAnswer(${i}, ${idx}, this)">
        ${c}
      </button>
    `).join("")}
  </div>
`;
  });

  html += `
  <button class="btn" onclick="gradeQuiz()">採点する</button>
</div>

<script>
${EXPORT_JS}
</script>

</body>
</html>
`;

  navigator.clipboard.writeText(html);
  alert("HTML（CSS・JS込み）をコピーしました！");
}

