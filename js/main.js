async function initializeApp() {
    try {
        // 初期ベンダーリストの取得
        const vendorList = await api.getVendorList();
        const vendorSelect = document.getElementById('vendorSelect');
        const productSelect = document.getElementById('productSelect');
        const versionInput = document.getElementById('versionInput');

        // 取得したベンダー情報を<select>に追加
        vendorList.forEach(vendor => {
            const option = document.createElement('option');
            option.value = vendor.id;
            option.textContent = vendor.name;
            vendorSelect.appendChild(option);
        });

        // ベンダーが選択された際の処理
        vendorSelect.addEventListener('change', async () => {
            const vendorId = vendorSelect.value;

            // productSelectを初期化
            productSelect.innerHTML = '';
            const defaultOption = document.createElement('option');

            if (!vendorId) {
                defaultOption.value = '';
                defaultOption.textContent = 'ベンダーを選択してください';
                productSelect.appendChild(defaultOption);
                productSelect.disabled = true;
                versionInput.value = '';
                versionInput.disabled = true;
                return;
            }

            defaultOption.value = '';
            defaultOption.textContent = '選択してください';
            productSelect.appendChild(defaultOption);

            try {
                const products = await api.getProductList(vendorId);
                products.forEach(product => {
                    const opt = document.createElement('option');
                    opt.value = product.id;
                    opt.textContent = product.name;
                    productSelect.appendChild(opt);
                });
                productSelect.disabled = false;
            } catch (error) {
                console.error('製品リスト取得エラー:', error);
                productSelect.disabled = true;
            }

            versionInput.value = '';
            versionInput.disabled = true;
        });

        // 製品選択時のバージョン入力欄切り替え
        productSelect.addEventListener('change', () => {
            if (productSelect.value) {
                versionInput.disabled = false;
            } else {
                versionInput.value = '';
                versionInput.disabled = true;
            }
        });

        // 初期状態でproductSelectとversionInputを無効化
        productSelect.disabled = true;
        versionInput.disabled = true;
    } catch (error) {
        console.error('初期化エラー:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new UI();
    initializeApp();
});
