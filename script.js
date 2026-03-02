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
const numEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

// 計算邏輯：
// 進位至最接近的 0 或 5
function computeAdjustedTWD(yen, rate) {
  const rawTwd = yen * rate;
  // 1. 先把小數點直接砍掉，只取整數 (例如 475.2 -> 475)
  let floorTwd = Math.floor(rawTwd);
  
  // 2. 判斷最後一碼
  const lastDigit = floorTwd % 10;
  
  if (lastDigit === 0 || lastDigit === 5) {
    return floorTwd; // 已經是 0 或 5，直接回傳
  } else if (lastDigit < 5) {
    return floorTwd + (5 - lastDigit); // 1~4 進到 5
  } else {
    return floorTwd + (10 - lastDigit); // 6~9 進到 10
  }
}

// 更新預估單價顯示
function updateTWDDisplay() {
  const yen = parseFloat(yenInput.value);
  const rate = parseFloat(rateInput.value);
  if (!isNaN(yen) && !isNaN(rate)) {
    twdInput.value = computeAdjustedTWD(yen, rate);
  } else {
    twdInput.value = "";
  }
}

yenInput.addEventListener("input", updateTWDDisplay);
rateInput.addEventListener("input", updateTWDDisplay);

// 渲染表格內容
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
      <td style="font-weight:800; color:var(--accent);">$${formatNum(item.subtotal)}</td>
      <td><button class="delBtn" onclick="deleteItem(${index})" title="移除">✕</button></td>
    `;
    listBody.appendChild(row);
  });

  totalCell.textContent = "$" + formatNum(totalSum);
}

// 刪除品項
window.deleteItem = function(index) {
  cartItems.splice(index, 1);
  renderTable();
}

// 加入清單按鈕邏輯
addBtn.addEventListener("click", () => {
  const item = itemInput.value.trim();
  const unitPrice = parseInt(twdInput.value, 10);
  const qty = parseInt(qtyInput.value, 10);
  const yenPrice = parseFloat(yenInput.value);
  const exchangeRate = parseFloat(rateInput.value);

  if (!item) {
    itemInput.focus();
    return;
  };
  if (isNaN(unitPrice)) return;

  cartItems.push({
    id: Date.now(),
    name: item,
    yen: yenPrice,
    rate: exchangeRate,
    price: unitPrice,
    qty: qty,
    subtotal: unitPrice * qty
  });

  renderTable();
  
  // 清空輸入欄位
  itemInput.value = "";
  yenInput.value = "";
  twdInput.value = "";
  qtyInput.value = "1";
  itemInput.focus();
});

// 重設按鈕邏輯
clearBtn.addEventListener("click", () => {
  if (cartItems.length === 0) return;
  if (confirm("確定要清空所有項目嗎？")) {
    cartItems = [];
    renderTable();
  }
});

// 複製內容按鈕邏輯
copyBtn.addEventListener("click", () => {
  if (cartItems.length === 0) return;
  
  let text = "📋 喊單內容：\n-----------------------------------\n";
  cartItems.forEach((item, index) => {
    const formattedRate = item.rate.toFixed(3);
    const numberPrefix = numEmojis[index] ? numEmojis[index] : (index + 1) + '. ';
    text += `${numberPrefix}${item.name}\n   ¥${formatNum(item.yen)} × ${formattedRate} ≈ $${formatNum(item.price)}\n`;
    text += `   (數量 × ${item.qty}) 小計：$${formatNum(item.subtotal)}\n`;
  });
  text += `-----------------------------------\n💰 總計金額：${totalCell.textContent}`;

  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    const originalText = copyBtn.innerText;
    copyBtn.innerText = "COPIED!";
    copyBtn.style.backgroundColor = "#10b981";
    setTimeout(() => {
      copyBtn.innerText = originalText;
      copyBtn.style.backgroundColor = "";
    }, 1500);
  } catch (err) {
    console.error("複製失敗", err);
  }
  document.body.removeChild(textArea);
});
