/**********************
 * タブ切り替え
 **********************/
function openTab(pageId) {
  // タブ
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });

  // ページ
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  // 対象をアクティブに
  document.querySelector(`.tab[data-page="${pageId}"]`).classList.add('active');
  document.getElementById(pageId).classList.add('active');
}

/**********************
 * 問題データ
 **********************/
let questions = [];

/**********************
 * 問題追加
 **********************/
function addQuestion() {
  const question = document.getElementById('question').value;
  const choices = Array.from(document.querySelectorAll('.choice')).map(c => c.value);
  const answer = document.getElementById('answer').value;
  const explanation = document.getElementById('explanation').value;

  questions.push({
    question,
    choices,
    answer,
    explanation
  });

  alert('問題を追加しました');
}

/**********************
 * プレビュー
 **********************/
function showPreview() {
  const preview = document.getElementById('preview');
  preview.innerHTML = '';

  questions.forEach((q, i) => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>Q${i + 1}. ${q.question}</h3>
      <ul>
        ${q.choices.map(c => `<li>${c}</li>`).join('')}
      </ul>
    `;
    preview.appendChild(div);
  });
}

/**********************
 * HTML書き出し（仮）
 **********************/
function exportHTML() {
  alert('ここにHTML出力処理を作る予定');
}
