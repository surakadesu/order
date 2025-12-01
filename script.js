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

// cartItems 現在會多儲存 yen 和 rate
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
    // 注意：表格中仍然只顯示最終的台幣價格
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

// 新增項目功能 - 【關鍵修改點：儲存原始日幣和匯率】
addBtn.addEventListener("click", () => {
  const item = itemInput.value.trim();
  const unitPrice = parseInt(twdInput.value, 10);
  const qty = parseInt(qtyInput.value, 10);
  // 新增：抓取原始輸入值
  const yenPrice = parseFloat(yenInput.value);
  const exchangeRate = parseFloat(rateInput.value);

  if (!item) return alert("請輸入品項名稱");
  if (isNaN(unitPrice)) return alert("請確認日幣與匯率");
  if (isNaN(qty) || qty < 1) return alert("數量錯誤");
  // 增加對原始價格的檢查
  if (isNaN(yenPrice) || isNaN(exchangeRate)) return alert("請確認日幣與匯率的數字格式正確");

  const subtotal = unitPrice * qty;

  const newItem = {
    id: Date.now(),
    name: item,
    yen: yenPrice,        // <-- 新增
    rate: exchangeRate,   // <-- 新增
    price: unitPrice,     // TWD unit price (rounded)
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

// 複製清單功能 - 【關鍵修改點：調整複製格式】
copyBtn.addEventListener("click", () => {
  if (cartItems.length === 0) return alert("清單是空的");
  
  // 組合文字清單 - 採用新格式
  let text = "📋 團購詳細清單\n------------------\n";
  
  cartItems.forEach(item => {
    // 輸出格式:
    // [品項名稱] (x [數量])
    //   單價計算: ¥[日幣] × [匯率] ≈ $[台幣單價]
    //   小計: $[小計台幣]
    
    // 匯率固定顯示小數點後四位
    const formattedRate = item.rate.toFixed(4);
    
    text += `${item.name} (x${item.qty})\n`;
    text += `  單價計算: ¥${formatNum(item.yen)} × ${formattedRate} ≈ $${formatNum(item.price)}/件\n`;
    text += `  小計: $${formatNum(item.subtotal)}\n`;
  });

  text += `------------------\n💰 最終總計：${totalCell.textContent}`;

  // 使用 Clipboard API 進行複製
  navigator.clipboard.writeText(text).then(() => {
    const originalText = copyBtn.innerText;
    copyBtn.innerText = "✅ 已複製";
    setTimeout(() => copyBtn.innerText = originalText, 1500);
  }).catch(err => {
    console.error("複製失敗：", err);
    alert("複製失敗，請手動複製下列清單：\n\n" + text);
  });
});
