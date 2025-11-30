// --- DOM 元素選取 ---
const yenInput = document.getElementById("yen");
const rateInput = document.getElementById("rate");
const itemInput = document.getElementById("itemName");
const twdInput = document.getElementById("twd");
const qtyInput = document.getElementById("qty");

const addBtn = document.getElementById("addBtn");
const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");

const listBody = document.getElementById("listBody");
const totalCell = document.getElementById("total");

let cartItems = [];
const formatNum = (num) => num.toLocaleString('zh-TW');

// 計算邏輯：無條件進位至 0 或 5
function computeAdjustedTWD(yen, rate) {
  const rawTwd = yen * rate;
  return Math.ceil(rawTwd / 5) * 5;
}

// 更新台幣單價顯示
function updateTWDDisplay() {
  const yen = parseFloat(yenInput.value);
  const rate = parseFloat(rateInput.value);
  if (!isNaN(yen) && !isNaN(rate)) {
    twdInput.value = computeAdjustedTWD(yen, rate);
  } else {
    twdInput.value = "";
  }
}

// 監聽日幣與匯率輸入，更新台幣單價
yenInput.addEventListener("input", updateTWDDisplay);
rateInput.addEventListener("input", updateTWDDisplay);

// 渲染表格與計算總和
function renderTable() {
  listBody.innerHTML = "";
  let totalSum = 0;

  cartItems.forEach((item, index) => {
    totalSum += item.subtotal;
    
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>$${formatNum(item.price)}</td>
      <td>${item.qty}</td>
      <td style="font-weight:bold;">$${formatNum(item.subtotal)}</td>
      <td><button class="delBtn" onclick="deleteItem(${index})" title="刪除">✕</button></td>
    `;
    listBody.appendChild(row);
  });

  totalCell.textContent = "$" + formatNum(totalSum);
}

// 刪除單項功能
window.deleteItem = function(index) {
  cartItems.splice(index, 1);
  renderTable();
}

// 新增項目功能
addBtn.addEventListener("click", () => {
  const item = itemInput.value.trim();
  const unitPrice = parseInt(twdInput.value, 10);
  const qty = parseInt(qtyInput.value, 10);

  if (!item) return alert("請輸入品項名稱");
  if (isNaN(unitPrice)) return alert("請確認日幣與匯率");
  if (isNaN(qty) || qty < 1) return alert("數量錯誤");

  const subtotal = unitPrice * qty;

  const newItem = {
    id: Date.now(),
    name: item,
    price: unitPrice,
    qty: qty,
    subtotal: subtotal
  };
  cartItems.push(newItem);

  renderTable();
  
  // 清空與聚焦邏輯
  itemInput.value = "";
  yenInput.value = "";
  twdInput.value = "";
  qtyInput.value = "1";
  itemInput.focus();
});

// 清空全部功能
clearBtn.addEventListener("click", () => {
  if (cartItems.length === 0) return;
  if (confirm("確定要清空清單？")) {
    cartItems = [];
    renderTable();
  }
});

// 複製清單功能 (現在應能正常運作)
copyBtn.addEventListener("click", () => {
  if (cartItems.length === 0) return alert("清單是空的");
  
  // 組合文字清單
  let text = "📋 喊單內容\n------------------\n";
  cartItems.forEach(item => {
    text += `${item.name} x ${item.qty} = $${formatNum(item.subtotal)}\n`;
  });
  text += `------------------\n💰 總計：${totalCell.textContent}`;

  // 使用 Clipboard API
  navigator.clipboard.writeText(text).then(() => {
    const originalText = copyBtn.innerText;
    copyBtn.innerText = "✅ 已複製";
    setTimeout(() => copyBtn.innerText = originalText, 1500);
  }).catch(err => {
    // 即使在 GitHub Pages 上失敗，也只是給使用者提示，通常是瀏覽器或權限問題。
    console.error("複製失敗：", err);
    alert("複製失敗，請手動複製下列清單：\n\n" + text);
  });
});
