/* ============================================================
   接待じゃんけん 出世編 — script.js

   入社するボタンを押したときに
   1. タイトル画面を隠して、申し送り画面を表示する

   接待を始めるボタンを押したときに
   1. 機嫌・疑い・回数などを最初の状態に戻す
   2. 申し送り画面を隠して、対戦画面を表示する
   3. 1回戦の準備をする（showRound を呼ぶ）

   手のボタンを押したときに
   1. 自分の手と、上司の手を決める（上司は癖で決める）
   2. お互いの手を表示して、勝ち負けを判定する
   3. 結果で機嫌と疑いを変える
      ・負け → 機嫌+20、疑い+15（連続で負けるたびに+10ずつ増える）
      ・あいこ → 機嫌+5、疑い-15
      ・勝ち → 機嫌-30、疑いを0に戻す
   4. メーター・上司の顔・セリフを変える
   5. 手のボタンを隠して、次へボタンを出す

   次へボタンを押したときに
   ・疑いが100 → 左遷　・機嫌が0 → 左遷
   ・5回終わったら、機嫌70以上で昇進、それ以外は見送り
   ・それ以外は、次の回へ進む
============================================================ */

let handNames = ["グー", "チョキ", "パー"];        // ★
let handEmoji = ["✊", "✌️", "✋"];
let places = ["北海道・稚内営業所", "社史編纂室", "離島支社（船で4時間）", "倉庫の在庫管理課"];

let mood = 50;          // 機嫌
let sus = 0;            // 疑い
let loseStreak = 0;     // 連続で負けた回数
let round = 1;          // 何回戦か
let lastBossHand = -1;  // 上司が前回出した手（最初は無し）
let loseCount = 0;      // 負けた回数
let drawCount = 0;      // あいこの回数
let winCount = 0;       // 勝った回数

// ===== 数字を0〜100の間に収める関数 =====
function limit(value) {
   if (value < 0) {
      value = 0;
   }
   if (value > 100) {
      value = 100;
   }
   return value;
}

// ===== 田中係長の手を決める関数（癖：前回と同じ手を出しがち） =====
function getBossHand() {
   if (lastBossHand !== -1 && Math.random() < 0.7) {
      return lastBossHand;                      // 10回に7回は前回と同じ手
   }
   return Math.floor(Math.random() * 3);        // ★ それ以外はランダム
}

// ===== メーターを表示する関数 =====
function showMeters() {
   $(".mood-number").text(mood);
   $(".mood-bar").css("width", mood + "%");
   $(".sus-number").text(sus);
   $(".sus-bar").css("width", sus + "%");
}

// ===== 1回戦ごとの準備をする関数 =====
function showRound() {
   $(".round").text(round + " / 5 回戦");
   $(".boss-hand").text("✊");
   $(".my-hand").text("✊");
   $(".call").text("最初はグー、じゃんけん…");
   $(".delta").text("");
   $(".boss-face").attr("src", "img/boss_tanaka_normal.png");

   if (sus >= 60) {
      $(".speech").text("……君、わざと負けてない？");
   } else {
      $(".speech").text("よーし、いくぞ！");
   }

   $(".hand-buttons").show();
   $(".next-button").hide();
}

// ===== 辞令を表示する関数 =====
function showResult(type) {
   if (type === "clear") {
      $(".decree-text").text("主任に任ずる");
      $(".decree-reason").text("係長田中氏への接待における、見事な負けっぷりを評価する。");
      $(".hanko").text("人事");
      $(".comment-face").attr("src", "img/boss_tanaka_happy.png");
      $(".comment-line").text("君の負けっぷりは、実に見事だった。");
      $(".result-button").text("もう一度、接待する");
   } else if (type === "stay") {
      $(".decree-text").text("昇進を見送る");
      $(".decree-reason").text("係長田中氏の機嫌を、取りきれなかったため。");
      $(".hanko").text("据置");
      $(".comment-face").attr("src", "img/boss_tanaka_normal.png");
      $(".comment-line").text("まあ、悪くはなかったがね。");
      $(".result-button").text("来年こそ昇進する");
   } else {
      // 左遷（疑い100、または機嫌0）
      let place = places[Math.floor(Math.random() * places.length)];
      $(".decree-text").text(place + "への異動を命ずる");
      if (type === "sus") {
         $(".decree-reason").text("わざと負けていることが、係長田中氏に見抜かれたため。");
         $(".comment-line").text("……君の接待は、見え透いているんだよ。");
      } else {
         $(".decree-reason").text("係長田中氏を、本気で怒らせたため。");
         $(".comment-line").text("顔も見たくない。");
      }
      $(".hanko").text("左遷");
      $(".comment-face").attr("src", "img/boss_tanaka_angry.png");
      $(".result-button").text("転職して出直す");
   }

   $(".stats").text("負けた " + loseCount + "回 ／ あいこ " + drawCount + "回 ／ 勝った " + winCount + "回");

   $(".play-screen").hide();
   $(".result-screen").css("display", "flex");
}

// ===== 入社するボタン =====
$(".start-button").on("click", function () {
   $(".title-screen").hide();
   $(".brief-screen").css("display", "flex");
});

// ===== 接待を始めるボタン =====
$(".brief-button").on("click", function () {
   // 1. 最初の状態に戻す
   mood = 50;
   sus = 0;
   loseStreak = 0;
   round = 1;
   lastBossHand = -1;
   loseCount = 0;
   drawCount = 0;
   winCount = 0;
   showMeters();

   // 2. 対戦画面を表示する
   $(".brief-screen").hide();
   $(".play-screen").css("display", "flex");

   // 3. 1回戦の準備
   showRound();
});

// ===== 手のボタン =====
$(".hand-button").on("click", function () {
   // 1. 自分の手と、上司の手を決める
   let playerHand = $(this).data("hand");        // ★
   let bossHand = getBossHand();
   lastBossHand = bossHand;

   // 2. お互いの手を表示して、勝ち負けを判定する
   $(".boss-hand").text(handEmoji[bossHand]);
   $(".my-hand").text(handEmoji[playerHand]);

   let result = "";                              // ★ ここから前のコードと同じ判定
   if (playerHand === bossHand) {
      result = "あいこ";
   } else if (
      (playerHand === 0 && bossHand === 1) ||
      (playerHand === 1 && bossHand === 2) ||
      (playerHand === 2 && bossHand === 0)
   ) {
      result = "勝ち";
   } else {
      result = "負け";
   }                                             // ★ ここまで

   // 3. 結果で機嫌と疑いを変える  4. 顔とセリフを変える
   if (result === "負け") {
      mood = mood + 20;
      sus = sus + 15 + 10 * loseStreak;
      loseStreak = loseStreak + 1;
      loseCount = loseCount + 1;
      $(".call").text("負けました！（接待成功）");
      $(".boss-face").attr("src", "img/boss_tanaka_happy.png");
      $(".speech").text("はっはっは！まだまだだな！");
   } else if (result === "あいこ") {
      mood = mood + 5;
      sus = sus - 15;
      loseStreak = 0;
      drawCount = drawCount + 1;
      $(".call").text("あいこ（いい勝負）");
      $(".boss-face").attr("src", "img/boss_tanaka_normal.png");
      $(".speech").text("おっ、やるなあ！");
   } else {
      mood = mood - 30;
      sus = 0;
      loseStreak = 0;
      winCount = winCount + 1;
      $(".call").text("勝ってしまった……");
      $(".boss-face").attr("src", "img/boss_tanaka_angry.png");
      $(".speech").text("……君、空気読めないって言われない？");
   }

   mood = limit(mood);
   sus = limit(sus);
   showMeters();

   // 5. 手のボタンを隠して、次へボタンを出す
   $(".hand-buttons").hide();
   $(".next-button").show();
});

// ===== 次へボタン =====
$(".next-button").on("click", function () {
   if (sus >= 100) {
      showResult("sus");
   } else if (mood <= 0) {
      showResult("angry");
   } else if (round >= 5) {
      if (mood >= 70) {
         showResult("clear");
      } else {
         showResult("stay");
      }
   } else {
      round = round + 1;
      showRound();
   }
});

// ===== 辞令画面のボタン =====
$(".result-button").on("click", function () {
   $(".result-screen").hide();
   $(".title-screen").show();
});