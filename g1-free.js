/**
 * g1-free.js — Chỉ lấy gói FREE 0đ 1 tháng (1month_eft.acq) cho cả 2 nút 20TB & 30TB
 * Tuyệt đối KHÔNG lùi về gói trả phí (90p / 75p).
 * Repo: https://github.com/Tugle07/g1-free
 */
"use strict";

console.log("[g1-free] ONLY FREE 1M loaded");

/* Bảng ánh xạ cố định: Cả nút 20TB và 30TB đều ép thẳng sang mã FREE 1 tháng (1month_eft.acq) */
var SKU_MAP = {
  "g1.ios.20tb.m.v2":     "g1.ai.ultra.1month_eft.acq",
  "g1.ios.30tb.ai.pro.m": "g1.ai.ultra.1month_eft.acq"
};

function occurrences(s, needle) {
  return needle ? s.split(needle).length - 1 : 0;
}

function run() {
  var body = $response && $response.body;
  if (typeof body !== "string" || body === "") {
    $done({});
    return;
  }

  /* Quét xem trong danh mục trả về có mã 20tb free riêng (g1.20tb.1month_eft.acq) hay không */
  var raw = body.match(/g1\.[a-z0-9._]{2,60}acq/g) || [];
  var seen = {};
  var catalog = [];
  for (var r = 0; r < raw.length; r++) {
    if (!seen[raw[r]]) {
      seen[raw[r]] = 1;
      catalog.push(raw[r]);
    }
  }
  console.log("[g1-free] Danh mục .acq hiện có: " + (catalog.join(", ") || "Không có"));

  var out = body, total = 0;
  var froms = Object.keys(SKU_MAP);
  for (var k = 0; k < froms.length; k++) {
    var from = froms[k];
    var n = occurrences(out, from);
    if (n === 0) continue;

    var to = SKU_MAP[from];
    /* Nếu là nút 20TB và trên server có mã g1.20tb.1month_eft.acq thì lấy mã 20TB Free, còn không thì lấy thẳng g1.ai.ultra.1month_eft.acq (30TB Free) */
    if (from === "g1.ios.20tb.m.v2" && catalog.indexOf("g1.20tb.1month_eft.acq") !== -1) {
      to = "g1.20tb.1month_eft.acq";
    }

    out = out.split(from).join(to);
    total += n;
    console.log("[g1-free] " + from + " -> " + to + " x" + n);
  }

  console.log(total ? "[g1-free] Đã ép FREE 0đ cho " + total + " vị trí" : "[g1-free] Không tìm thấy mã gốc");
  $done(total ? { body: out } : {});
}

run();
