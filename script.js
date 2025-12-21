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
