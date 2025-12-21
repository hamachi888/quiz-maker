/**
 * タブを切り替える関数
 * @param {string} name 表示したいページID
 */
function openTab(name) {

  // すべてのタブの active を外す
  document.querySelectorAll(".tab").forEach(tab => {
    tab.classList.remove("active");
  });

  // すべてのページを非表示
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  // 対応するタブをアクティブに
  document
    .querySelector(`[data-page="${name}"]`)
    .classList.add("active");

  // 対応するページを表示
  document
    .getElementById(name)
    .classList.add("active");
}

// タブクリック時の処理を登録
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    openTab(tab.dataset.page);
  });
});

let quizData = [];
let userAnswers = [];

/* ===== 問題追加 ===== */
function addQuestion() {
  const question = document.getElementById("question").value;
  const choices = Array.from(document.querySelectorAll(".choice")).map(c => c.value);
  const answer = document.getElementById("answer").value;
  const explanation = document.getElementById("explanation").value;

  if (!question || choices.some(c => !c)) {
    alert("すべて入力してください");
    return;
  }

  quizData.push({ question, choices, answer, explanation });
  alert(`問題を追加しました（${quizData.length}問）`);
}

/* ===== プレビュー表示 ===== */
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
        <button class="choice-btn" onclick="selectAnswer(${i}, ${idx}, this)">
          ${c}
        </button>
      `).join("")}
    `;

    preview.appendChild(card);
  });

  // 採点ボタン追加
  preview.innerHTML += `<button class="btn" onclick="gradeQuiz()">採点する</button>`;
}

/* ===== 選択処理 ===== */
function selectAnswer(qIndex, aIndex, btn) {
  userAnswers[qIndex] = aIndex;

  // 同じ問題のボタンの選択解除
  btn.parentElement.querySelectorAll(".choice-btn").forEach(b =>
    b.classList.remove("selected")
  );

  btn.classList.add("selected");
}


    preview.appendChild(card);
  });
}

