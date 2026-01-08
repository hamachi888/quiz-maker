/**
 * export.js
 * 
 * WordPress用のファイルを書き出すための処理
 * HTML、CSS、JSを生成してダウンロードします
 */

// =====================================
// 📄 HTML生成
// =====================================

/**
 * WordPress用の完全なHTML文字列を生成
 * 
 * このHTMLには以下が含まれます：
 * - クイズのHTML構造
 * - quizDataの埋め込み
 * - preview.jsの全ロジック
 * - 初期化コード
 * 
 * @returns {string} 完全なHTML文字列
 */
function generateWordPressHTML() {
  console.log('📝 WordPress用HTML生成開始');
  
  // preview.jsの中身を取得（関数定義部分）
  const previewJsCode = getPreviewJsCode();
  
  // quizDataをJSON文字列に変換
  const quizDataString = JSON.stringify(quizData, null, 2);
  
  // 完全なHTMLを生成
  const html = `<!-- クイズアプリ -->
<div id="quiz-app-root">
  <div class="loading">読み込み中...</div>
</div>

<script>
// =====================================
// クイズデータ
// =====================================
const quizData = ${quizDataString};

// =====================================
// クイズ制御ロジック
// =====================================
${previewJsCode}

// =====================================
// 初期化
// =====================================
document.addEventListener('DOMContentLoaded', function() {
  const rootElement = document.getElementById('quiz-app-root');
  if (rootElement) {
    rootElement.innerHTML = generateQuizHTML();
    showCurrentQuestion();
  }
});
</script>

<style>
/* このスタイルは quiz.css の内容をここに貼り付けてください */
/* または、WordPress側でquiz.cssを読み込むように設定してください */
</style>`;
  
  console.log('✅ HTML生成完了');
  return html;
}

/**
 * preview.jsのコードを文字列として取得
 * 
 * 実際の実装では、preview.jsの関数定義部分を
 * 文字列として抽出します
 * 
 * @returns {string} JavaScriptコード
 */
function getPreviewJsCode() {
  // 必要な関数を文字列として組み立て
  const code = `
// グローバル変数
let currentQuestionIndex = 0;
let score = 0;

// クイズ全体のHTML生成
function generateQuizHTML() {
  if (!quizData || !quizData.questions) {
    return '<p>⚠️ クイズデータが読み込まれていません</p>';
  }
  const title = quizData.meta.title || 'クイズ';
  return \`
    <div class="quiz-app">
      <div class="quiz-header">
        <h1>\${title}</h1>
        <p class="quiz-progress">問題 <span id="current-question">1</span> / \${quizData.questions.length}</p>
      </div>
      <div class="quiz-body" id="quiz-body">
        ここに問題が表示されます
      </div>
    </div>
  \`;
}

// choice型問題の描画
function renderChoiceQuestion(questionData, questionIndex) {
  const questionText = questionData.question;
  let choicesHTML = '';
  questionData.choices.forEach((choice, index) => {
    choicesHTML += \`
      <button class="choice-button" onclick="handleChoiceClick(\${questionIndex}, \${index})" data-index="\${index}">
        \${choice}
      </button>
    \`;
  });
  return \`
    <div class="question-container" data-question-id="\${questionData.id}">
      <h2 class="question-text">\${questionText}</h2>
      <div class="choices-container">\${choicesHTML}</div>
      <div class="feedback" id="feedback"></div>
    </div>
  \`;
}

// text型問題の描画
function renderTextQuestion(questionData, questionIndex) {
  const questionText = questionData.question;
  return \`
    <div class="question-container" data-question-id="\${questionData.id}">
      <h2 class="question-text">\${questionText}</h2>
      <div class="text-answer-container">
        <input type="text" class="text-input" id="text-input-\${questionIndex}" placeholder="答えを入力してください" autocomplete="off">
        <button class="submit-button" onclick="handleTextSubmit(\${questionIndex})">回答する</button>
      </div>
      <div class="feedback" id="feedback"></div>
    </div>
  \`;
}

// 問題タイプ別振り分け
function renderQuestion(questionData, questionIndex) {
  switch (questionData.type) {
    case 'choice': return renderChoiceQuestion(questionData, questionIndex);
    case 'text': return renderTextQuestion(questionData, questionIndex);
    default: return '<p class="error">⚠️ 未対応の問題形式です</p>';
  }
}

// choice型の回答判定
function handleChoiceClick(questionIndex, selectedIndex) {
  const questionData = quizData.questions[questionIndex];
  const correctIndex = questionData.answer;
  const isCorrect = (selectedIndex === correctIndex);
  const feedbackElement = document.getElementById('feedback');
  
  if (isCorrect) {
    score++;
    let feedbackHTML = '🎉 正解！';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show correct';
  } else {
    const correctAnswer = questionData.choices[correctIndex];
    let feedbackHTML = '❌ 不正解。正解は「' + correctAnswer + '」です。';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show incorrect';
  }
  
  const buttons = document.querySelectorAll('.choice-button');
  buttons.forEach(button => {
    button.disabled = true;
    button.style.cursor = 'not-allowed';
    button.style.opacity = '0.6';
  });
  
  const clickedButton = document.querySelector('.choice-button[data-index="' + selectedIndex + '"]');
  if (isCorrect) {
    clickedButton.style.backgroundColor = '#27ae60';
    clickedButton.style.color = 'white';
    clickedButton.style.borderColor = '#27ae60';
  } else {
    clickedButton.style.backgroundColor = '#e74c3c';
    clickedButton.style.color = 'white';
    clickedButton.style.borderColor = '#e74c3c';
    const correctButton = document.querySelector('.choice-button[data-index="' + correctIndex + '"]');
    correctButton.style.backgroundColor = '#27ae60';
    correctButton.style.color = 'white';
    correctButton.style.borderColor = '#27ae60';
  }
  
  showNextButton();
}

// text型の回答判定
function handleTextSubmit(questionIndex) {
  const questionData = quizData.questions[questionIndex];
  const inputElement = document.getElementById('text-input-' + questionIndex);
  const userAnswer = inputElement.value;
  
  if (userAnswer.trim() === '') {
    alert('答えを入力してください');
    return;
  }
  
  const correctAnswer = questionData.answer;
  const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
  const feedbackElement = document.getElementById('feedback');
  
  if (isCorrect) {
    score++;
    let feedbackHTML = '🎉 正解！';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show correct';
    inputElement.style.borderColor = '#27ae60';
    inputElement.style.backgroundColor = '#d4edda';
  } else {
    let feedbackHTML = '❌ 不正解。正解は「' + correctAnswer + '」です。';
    if (questionData.explanation) {
      feedbackHTML += '<div class="explanation">' + questionData.explanation + '</div>';
    }
    feedbackElement.innerHTML = feedbackHTML;
    feedbackElement.className = 'feedback show incorrect';
    inputElement.style.borderColor = '#e74c3c';
    inputElement.style.backgroundColor = '#f8d7da';
  }
  
  inputElement.disabled = true;
  const submitButton = document.querySelector('.submit-button');
  submitButton.disabled = true;
  submitButton.style.cursor = 'not-allowed';
  submitButton.style.opacity = '0.6';
  
  showNextButton();
}

// 次へボタンを表示
function showNextButton() {
  if (document.getElementById('next-button')) return;
  const feedbackElement = document.getElementById('feedback');
  const nextButton = document.createElement('button');
  nextButton.id = 'next-button';
  nextButton.className = 'next-button';
  nextButton.textContent = '次へ ➡️';
  nextButton.onclick = nextQuestion;
  feedbackElement.appendChild(nextButton);
}

// 現在の問題を表示
function showCurrentQuestion() {
  const questionData = quizData.questions[currentQuestionIndex];
  const questionHTML = renderQuestion(questionData, currentQuestionIndex);
  const quizBody = document.getElementById('quiz-body');
  quizBody.innerHTML = questionHTML;
  updateProgress();
}

// 進行状況を更新
function updateProgress() {
  const currentQuestionElement = document.getElementById('current-question');
  if (currentQuestionElement) {
    currentQuestionElement.textContent = currentQuestionIndex + 1;
  }
}

// 次の問題へ
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.questions.length) {
    showCurrentQuestion();
  } else {
    showResult();
  }
}

// 結果画面を表示
function showResult() {
  const totalQuestions = quizData.questions.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  let message = '';
  if (percentage === 100) message = '🎉 完璧です！';
  else if (percentage >= 80) message = '👏 素晴らしい！';
  else if (percentage >= 60) message = '👍 よくできました！';
  else message = '💪 もう一度挑戦してみましょう！';
  
  const resultHTML = \`
    <div class="result-container">
      <h2>クイズ終了！</h2>
      <div class="score-display">
        <p class="score-number">\${score} / \${totalQuestions}</p>
        <p class="score-percentage">(\${percentage}%)</p>
      </div>
      <p class="result-message">\${message}</p>
      <button class="restart-button" onclick="restartQuiz()">もう一度挑戦</button>
    </div>
  \`;
  const quizBody = document.getElementById('quiz-body');
  quizBody.innerHTML = resultHTML;
}

// クイズをリスタート
function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  showCurrentQuestion();
}
`;
  
  return code;
}

// =====================================
// 🎨 CSS取得
// =====================================

/**
 * quiz.cssの内容を文字列として返す
 * 
 * 注意: fetch APIはfile://プロトコルで動作しないため、
 * CSS内容を直接文字列として定義しています。
 * 
 * @returns {string} CSS文字列
 */
function getQuizCSS() {
  console.log('🎨 CSS取得開始');
  
  // quiz.cssの内容をそのまま文字列として定義
  const cssContent = `/**
 * quiz.css
 * クイズ表示用のスタイルシート
 */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f2f5;
  padding: 20px;
  line-height: 1.6;
}

#app, #quiz-app-root {
  max-width: 600px;
  margin: 0 auto;
}

.quiz-app {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quiz-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.quiz-header h1 {
  color: #2c3e50;
  font-size: 28px;
  margin-bottom: 10px;
}

.quiz-progress {
  color: #7f8c8d;
  font-size: 14px;
}

.quiz-body {
  min-height: 200px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.question-container {
  padding: 20px;
}

.question-text {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 25px;
  font-weight: 600;
}

.choices-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.choice-button {
  padding: 15px 20px;
  font-size: 16px;
  background-color: #ffffff;
  border: 2px solid #3498db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.choice-button:hover {
  background-color: #3498db;
  color: white;
  transform: translateX(5px);
}

.choice-button:disabled {
  cursor: not-allowed !important;
  opacity: 0.6;
}

.choice-button:disabled:hover {
  transform: none !important;
}

.text-answer-container {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.text-input {
  flex: 1;
  padding: 12px 15px;
  font-size: 16px;
  border: 2px solid #bdc3c7;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}

.text-input:focus {
  border-color: #3498db;
}

.text-input::placeholder {
  color: #95a5a6;
}

.text-input:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.submit-button {
  padding: 12px 30px;
  font-size: 16px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background-color: #27ae60;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  cursor: not-allowed !important;
  opacity: 0.6;
  background-color: #95a5a6;
}

.submit-button:disabled:hover {
  transform: none !important;
  background-color: #95a5a6 !important;
}

.feedback {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  display: none;
}

.feedback.show {
  display: block;
}

.feedback.correct {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.feedback.incorrect {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

.explanation {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  font-weight: normal;
  font-size: 14px;
  text-align: left;
}

.next-button {
  margin-top: 15px;
  padding: 12px 30px;
  font-size: 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.next-button:hover {
  background-color: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.result-container {
  text-align: center;
  padding: 40px 20px;
}

.result-container h2 {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 30px;
}

.score-display {
  margin: 30px 0;
}

.score-number {
  font-size: 48px;
  font-weight: bold;
  color: #3498db;
  margin: 0;
}

.score-percentage {
  font-size: 24px;
  color: #7f8c8d;
  margin: 10px 0;
}

.result-message {
  font-size: 24px;
  margin: 30px 0;
}

.restart-button {
  padding: 15px 40px;
  font-size: 18px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.restart-button:hover {
  background-color: #27ae60;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.loading {
  text-align: center;
  color: #666;
  padding: 40px;
}

.error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}`;
  
  console.log('✅ CSS取得成功');
  console.log('CSS文字数:', cssContent.length);
  
  return cssContent;
}

/**
 * WordPress用のCSS文字列を生成
 * 
 * @returns {string} CSS文字列
 */
function generateWordPressCSS() {
  console.log('📝 WordPress用CSS生成開始');
  
  const cssContent = getQuizCSS();
  
  console.log('✅ CSS生成完了');
  return cssContent;
}

// =====================================
// 💾 ダウンロード処理
// =====================================

/**
 * テキストをファイルとしてダウンロード
 * 
 * @param {string} content - ファイルの内容
 * @param {string} filename - ファイル名
 * @param {string} mimeType - MIMEタイプ（デフォルト: text/plain）
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
  console.log(`💾 ダウンロード開始: ${filename}`);
  
  // Blobオブジェクトを作成
  const blob = new Blob([content], { type: mimeType });
  
  // Blob URLを作成
  const url = URL.createObjectURL(blob);
  
  // aタグを動的に作成
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // クリックイベントを発火
  document.body.appendChild(link);
  link.click();
  
  // 後片付け
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`✅ ダウンロード完了: ${filename}`);
}

/**
 * WordPress用のファイルを一括ダウンロード
 * 
 * HTML、CSS、JSの3ファイルをダウンロードします
 */
function downloadAllFiles() {
  console.log('📦 一括ダウンロード開始');
  
  try {
    // 1. HTMLファイルをダウンロード
    const htmlContent = generateWordPressHTML();
    downloadFile(htmlContent, 'quiz.html', 'text/html');
    
    // 2. CSSファイルをダウンロード
    const cssContent = generateWordPressCSS();
    downloadFile(cssContent, 'quiz.css', 'text/css');
    
    // 3. JS情報ファイル（README的なもの）
    const readmeContent = `WordPress クイズアプリ セットアップ手順

【ファイル構成】
- quiz.html : クイズのHTML（全機能埋め込み済み）
- quiz.css  : クイズのスタイルシート

【WordPressへの設置方法】

方法1: カスタムHTMLブロックに貼り付け（最簡単）
-------------------------------------------------
1. WordPressの固定ページまたは投稿を開く
2. 「カスタムHTML」ブロックを追加
3. quiz.html の内容を全てコピー＆ペースト
4. 「外観」→「カスタマイズ」→「追加CSS」を開く
5. quiz.css の内容を全てコピー＆ペースト
6. 公開！

方法2: ファイルアップロード（中級者向け）
-------------------------------------------------
1. FTPまたはファイルマネージャーでサーバーにアクセス
2. wp-content/uploads/quiz/ フォルダを作成
3. quiz.html と quiz.css をアップロード
4. 投稿に以下のコードを追加:

<link rel="stylesheet" href="/wp-content/uploads/quiz/quiz.css">
<div id="quiz-container"></div>
<script src="/wp-content/uploads/quiz/quiz.html"></script>

【注意事項】
- quiz.html には JavaScript が埋め込まれています
- quiz.css は必ず読み込んでください（見た目が崩れます）
- クイズデータは quiz.html に埋め込まれています

【カスタマイズ】
- 色を変えたい場合は quiz.css を編集
- 問題を変えたい場合は quiz.html 内の quizData を編集

作成日: ${new Date().toLocaleString('ja-JP')}
`;
    downloadFile(readmeContent, 'README.txt', 'text/plain');
    
    console.log('✅ 一括ダウンロード完了');
    alert('✅ ダウンロード完了！\n\n以下の3ファイルが保存されました：\n- quiz.html\n- quiz.css\n- README.txt');
    
  } catch (error) {
    console.error('❌ ダウンロードエラー:', error);
    alert('❌ ダウンロード失敗: ' + error.message);
  }
}

/**
 * CSS埋め込み版のWordPress用HTMLを生成
 * 
 * このHTMLには以下が含まれます：
 * - CSS（styleタグで埋め込み）
 * - クイズのHTML構造
 * - quizDataの埋め込み
 * - preview.jsの全ロジック
 * - 初期化コード
 * 
 * → HTML 1ファイルだけでクイズが動作！
 * 
 * @returns {string} 完全なHTML文字列
 */
function generateWordPressHTMLWithCSS() {
  console.log('📝 CSS埋め込み版HTML生成開始');
  
  // preview.jsのコードを取得
  const previewJsCode = getPreviewJsCode();
  
  // quizDataをJSON文字列に変換
  const quizDataString = JSON.stringify(quizData, null, 2);
  
  // CSSを取得
  const cssContent = getQuizCSS();
  
  // 完全なHTMLを生成
  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${quizData.meta.title || 'クイズ'}</title>
  
  <!-- クイズのスタイル -->
  <style>
${cssContent}
  </style>
</head>
<body>
  <!-- クイズアプリ -->
  <div id="quiz-app-root">
    <div class="loading">読み込み中...</div>
  </div>

  <script>
  // =====================================
  // クイズデータ
  // =====================================
  const quizData = ${quizDataString};

  // =====================================
  // クイズ制御ロジック
  // =====================================
  ${previewJsCode}

  // =====================================
  // 初期化
  // =====================================
  document.addEventListener('DOMContentLoaded', function() {
    const rootElement = document.getElementById('quiz-app-root');
    if (rootElement) {
      rootElement.innerHTML = generateQuizHTML();
      showCurrentQuestion();
    }
  });
  </script>
</body>
</html>`;
  
  console.log('✅ CSS埋め込み版HTML生成完了');
  return html;
}

/**
 * WordPress用のファイルを一括ダウンロード（CSS埋め込み版含む）
 * 
 * HTML（通常版）、HTML（CSS埋め込み版）、CSS、READMEの4ファイルをダウンロード
 */
function downloadAllFilesWithOptions() {
  console.log('📦 一括ダウンロード開始（全オプション）');
  
  try {
    // 1. 通常版HTMLファイルをダウンロード
    const htmlContent = generateWordPressHTML();
    downloadFile(htmlContent, 'quiz.html', 'text/html');
    
    // 2. CSS埋め込み版HTMLファイルをダウンロード
    const htmlWithCSSContent = generateWordPressHTMLWithCSS();
    downloadFile(htmlWithCSSContent, 'quiz-allinone.html', 'text/html');
    
    // 3. CSSファイルをダウンロード
    const cssContent = generateWordPressCSS();
    downloadFile(cssContent, 'quiz.css', 'text/css');
    
    // 4. README更新版
    const readmeContent = `WordPress クイズアプリ セットアップ手順

【ファイル構成】
- quiz.html         : クイズのHTML（CSS別ファイル）
- quiz-allinone.html: クイズのHTML（CSS埋め込み版）★おすすめ★
- quiz.css          : クイズのスタイルシート

【WordPressへの設置方法】

★方法1: オールインワン版（最も簡単・おすすめ！）
-------------------------------------------------
1. WordPressの固定ページまたは投稿を開く
2. 「カスタムHTML」ブロックを追加
3. quiz-allinone.html の内容を全てコピー＆ペースト
4. 公開！

→ これだけでOK！CSS設定不要！


方法2: 通常版（CSS別ファイル）
-------------------------------------------------
1. WordPressの固定ページまたは投稿を開く
2. 「カスタムHTML」ブロックを追加
3. quiz.html の中身（<div id="quiz-app-root">から）をコピー＆ペースト
4. 「外観」→「カスタマイズ」→「追加CSS」を開く
5. quiz.css の内容を全てコピー＆ペースト
6. 公開！


方法3: ファイルアップロード（中級者向け）
-------------------------------------------------
1. FTPまたはファイルマネージャーでサーバーにアクセス
2. wp-content/uploads/quiz/ フォルダを作成
3. quiz-allinone.html をアップロード
4. ブラウザで直接アクセス:
   https://あなたのサイト.com/wp-content/uploads/quiz/quiz-allinone.html

【各ファイルの違い】

quiz.html:
  - HTMLとCSSが分離
  - CSSを別途設定する必要がある
  - 複数ページで同じCSSを使いたい場合に便利

quiz-allinone.html:
  - HTML 1ファイルで完結
  - コピペするだけで動く
  - 初心者におすすめ

【カスタマイズ】
- 色を変えたい場合:
  quiz-allinone.html 内の <style> タグの中を編集
  
- 問題を変えたい場合:
  quiz-allinone.html 内の const quizData = の部分を編集

【注意事項】
- quiz-allinone.html はファイルサイズが大きめです
- ページ表示速度を最優先する場合は quiz.html + quiz.css を使用
- クイズデータは HTML に埋め込まれています

作成日: ${new Date().toLocaleString('ja-JP')}
バージョン: MVP 1.0
`;
    downloadFile(readmeContent, 'README.txt', 'text/plain');
    
    console.log('✅ 一括ダウンロード完了');
    alert('✅ ダウンロード完了！\n\n以下の4ファイルが保存されました：\n- quiz.html（通常版）\n- quiz-allinone.html（CSS埋め込み版）★おすすめ\n- quiz.css\n- README.txt\n\n初めての方は quiz-allinone.html をお使いください！');
    
  } catch (error) {
    console.error('❌ ダウンロードエラー:', error);
    alert('❌ ダウンロード失敗: ' + error.message);
  }
}

// =====================================
// 🎓 初級者向け説明コーナー
// =====================================

/**
 * 【JSON.stringify とは】
 * 
 * JavaScriptのオブジェクトを、JSON文字列に変換する
 * 
 * 例：
 * const obj = { name: "太郎", age: 25 };
 * const json = JSON.stringify(obj);
 * // → '{"name":"太郎","age":25}'
 * 
 * 第3引数に数字を渡すと、インデント（字下げ）される：
 * JSON.stringify(obj, null, 2)
 * // → {
 * //      "name": "太郎",
 * //      "age": 25
 * //    }
 */

/**
 * 【テンプレートリテラルのエスケープ】
 * 
 * テンプレートリテラルの中に、さらにテンプレートリテラルを
 * 埋め込む場合、バックスラッシュでエスケープします
 * 
 * const code = `
 *   const html = \`<div>\${value}</div>\`;
 * `;
 * 
 * \${...} → 生成されるコードでは ${...} になる
 */

/**
 * 【このファイルの役割】
 * 
 * 1. quizDataを取得
 * 2. preview.jsのコードを取得
 * 3. それらを組み合わせて、完全なHTMLを生成
 * 4. ダウンロードできるようにする
 * 
 * → WordPressにコピペするだけで動くHTMLが完成！
 */

/**
 * 【fetch API とは】
 * 
 * ファイルやAPIからデータを取得する仕組み
 * 
 * 基本的な使い方：
 * fetch('ファイルのパス')
 *   .then(response => response.text())
 *   .then(data => console.log(data));
 * 
 * async/awaitを使うともっとシンプル：
 * const response = await fetch('ファイルのパス');
 * const data = await response.text();
 */

/**
 * 【async/await とは】
 * 
 * 非同期処理を同期処理のように書ける仕組み
 * 
 * async function myFunction() {
 *   const data = await fetch('file.txt');  // 読み込み完了を待つ
 *   console.log(data);                     // 読み込み後に実行
 * }
 * 
 * - async: この関数は非同期だよ、という印
 * - await: 処理が終わるまで待つ
 * 
 * awaitは async function の中でしか使えない！
 */

/**
 * 【Promise とは】
 * 
 * 「将来的に値が返ってくる約束」を表すオブジェクト
 * 
 * fetch() は Promise<Response> を返す
 * → 「将来的にResponseが返ってくるよ」という意味
 * 
 * await を使うと、Promiseが解決されるまで待つ
 */

/**
 * 【Blob とは】
 * 
 * Binary Large Object の略
 * バイナリデータ（テキストやファイル）を扱うオブジェクト
 * 
 * 使い方：
 * const blob = new Blob([テキスト], { type: 'text/plain' });
 * 
 * ダウンロードに使う：
 * 1. Blobを作る
 * 2. URL.createObjectURL でURLを生成
 * 3. aタグのhrefに設定
 * 4. クリック！
 */

/**
 * 【URL.createObjectURL とは】
 * 
 * Blobオブジェクトから、ブラウザ内で使えるURLを生成
 * 
 * const url = URL.createObjectURL(blob);
 * // → "blob:http://localhost/xxx-xxx-xxx"
 * 
 * このURLを <a> タグの href に設定すると、
 * クリックでダウンロードできる！
 * 
 * 使い終わったら URL.revokeObjectURL(url) で解放
 */

/**
 * 【aタグの動的生成でダウンロード】
 * 
 * const link = document.createElement('a');
 * link.href = url;              // ダウンロードするURL
 * link.download = 'file.txt';   // 保存時のファイル名
 * link.click();                 // プログラムでクリック
 * 
 * → ユーザーの「ダウンロード」フォルダに保存される
 */

// =====================================
// 🔍 デバッグ用
// =====================================

if (typeof window !== 'undefined') {
  window.generateWordPressHTML = generateWordPressHTML;
  window.generateWordPressHTMLWithCSS = generateWordPressHTMLWithCSS;
  window.generateWordPressHTMLList = generateWordPressHTMLList;
  window.generateWordPressCSS = generateWordPressCSS;
  window.getQuizCSS = getQuizCSS;
  window.downloadFile = downloadFile;
  window.downloadAllFiles = downloadAllFiles;
  window.downloadAllFilesWithOptions = downloadAllFilesWithOptions;
  console.log('✅ export.js loaded');
  console.log('🔧 generateWordPressHTML関数が利用可能です');
  console.log('🔧 generateWordPressHTMLWithCSS関数が利用可能です（CSS埋め込み版）');
  console.log('🔧 generateWordPressHTMLList関数が利用可能です（一覧表示型）');
  console.log('🔧 generateWordPressCSS関数が利用可能です');
  console.log('🔧 downloadAllFiles関数が利用可能です');
  console.log('🔧 downloadAllFilesWithOptions関数が利用可能です（推奨）');
}