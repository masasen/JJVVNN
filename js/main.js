async function initializeApp() {
    try {
        // 初期ベンダーリストの取得
        const vendorList = await api.getVendorList();
        // ベンダーリストの解析とUIへの反映
        // TODO: XMLパースと選択肢の追加処理
    } catch (error) {
        console.error('初期化エラー:', error);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
