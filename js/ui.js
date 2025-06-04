class UI {
    constructor() {
        // 既存のプロパティに追加
        this.resultsControls = document.getElementById('resultsControls');
        this.sortBySelect = document.getElementById('sortBy');
        this.filterTextInput = document.getElementById('filterText');
        this.exportBtn = document.getElementById('exportBtn');
        this.searchBtn = document.getElementById('searchBtn');
        this.vendorSelect = document.getElementById('vendorSelect');
        this.productSelect = document.getElementById('productSelect');
        this.versionInput = document.getElementById('versionInput');
        this.startDateInput = document.getElementById('startDate');
        this.endDateInput = document.getElementById('endDate');
        this.resultsContainer = document.getElementById('searchResults');
        this.showHistoryBtn = document.getElementById('showHistoryBtn');
        this.closeHistoryBtn = document.getElementById('closeHistoryBtn');
        this.historyModal = document.getElementById('historyModal');
        this.searchHistory = document.getElementById('searchHistory');
        this.messageBox = document.getElementById('message');
        this.loadingOverlay = document.getElementById('loading');
        this.currentResults = [];
        this.searchHistoryData = this.loadSearchHistory();

        this.initializeEventListeners();
        this.initializeHistoryEventListeners();
    }

    initializeEventListeners() {
        // 既存のイベントリスナーに追加
        this.sortBySelect.addEventListener('change', () => this.updateResultsView());
        this.filterTextInput.addEventListener('input', () => this.updateResultsView());
        this.exportBtn.addEventListener('click', () => this.exportResults());
        this.searchBtn.addEventListener('click', () => this.onSearch());
    }

    sortResults(results) {
        const sortType = this.sortBySelect.value;
        return [...results].sort((a, b) => {
            switch (sortType) {
                case 'published-desc':
                    return new Date(b.published) - new Date(a.published);
                case 'published-asc':
                    return new Date(a.published) - new Date(b.published);
                case 'title':
                    return a.title.localeCompare(b.title, 'ja');
                default:
                    return 0;
            }
        });
    }

    filterResults(results) {
        const filterText = this.filterTextInput.value.toLowerCase();
        if (!filterText) return results;

        return results.filter(result => {
            return result.title.toLowerCase().includes(filterText) ||
                   result.description.toLowerCase().includes(filterText);
        });
    }

    updateResultsView() {
        const filteredResults = this.filterResults(this.currentResults);
        const sortedResults = this.sortResults(filteredResults);
        this.renderResults(sortedResults);
    }

    renderResults(results) {
        this.resultsContainer.innerHTML = '';

        if (results.length === 0) {
            this.resultsContainer.innerHTML = '<p>該当する脆弱性情報は見つかりませんでした。</p>';
            this.resultsControls.style.display = 'none';
            return;
        }

        const resultsList = document.createElement('div');
        resultsList.className = 'vuln-list';

        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'vuln-item';
            resultItem.innerHTML = `
                <h3><a href="${result.link}" target="_blank">${result.title}</a></h3>
                <p>${result.description}</p>
                <div class="vuln-meta">公開日: ${new Date(result.published).toLocaleDateString('ja-JP')}</div>
            `;
            resultsList.appendChild(resultItem);
        });

        this.resultsContainer.appendChild(resultsList);
        this.resultsControls.style.display = 'flex';
    }

    showMessage(message, type = '') {
        this.messageBox.textContent = message;
        this.messageBox.className = `message ${type}`.trim();
        this.messageBox.style.display = 'block';
        setTimeout(() => {
            this.messageBox.style.display = 'none';
        }, 4000);
    }

    showError(msg) {
        this.showMessage(msg, 'error');
    }

    showInfo(msg) {
        this.showMessage(msg, 'success');
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    validateSearchParams() {
        if (!this.vendorSelect.value) {
            this.showError('ベンダーを選択してください');
            return false;
        }
        if (!this.productSelect.value) {
            this.showError('製品を選択してください');
            return false;
        }
        if (!this.startDateInput.value || !this.endDateInput.value) {
            this.showError('検索期間を入力してください');
            return false;
        }
        if (this.startDateInput.value > this.endDateInput.value) {
            this.showError('開始日は終了日より前に設定してください');
            return false;
        }
        return true;
    }

    exportResults() {
        if (!this.currentResults.length) {
            this.showError('エクスポートする結果がありません');
            return;
        }

        const header = ['タイトル', '公開日', '説明', 'リンク'];
        const rows = this.currentResults.map(r => [
            r.title,
            r.published,
            r.description,
            r.link
        ]);

        const csvContent = [header, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'results.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    initializeHistoryEventListeners() {
        this.showHistoryBtn.addEventListener('click', () => this.openHistoryModal());
        this.closeHistoryBtn.addEventListener('click', () => this.closeHistoryModal());
        this.historyModal.addEventListener('click', (e) => {
            if (e.target === this.historyModal) {
                this.closeHistoryModal();
            }
        });
    }

    loadSearchHistory() {
        const history = localStorage.getItem('searchHistory');
        return history ? JSON.parse(history) : [];
    }

    saveSearchHistory() {
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistoryData));
    }

    addToHistory(searchParams) {
        const historyItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            params: searchParams,
            resultCount: this.currentResults.length
        };

        this.searchHistoryData.unshift(historyItem);
        // 最大50件まで保存
        if (this.searchHistoryData.length > 50) {
            this.searchHistoryData.pop();
        }
        this.saveSearchHistory();
    }

    renderSearchHistory() {
        this.searchHistory.innerHTML = '';
        
        if (this.searchHistoryData.length === 0) {
            this.searchHistory.innerHTML = '<p>検索履歴はありません。</p>';
            return;
        }

        this.searchHistoryData.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div class="history-item-content">
                    <div>ベンダー: ${item.params.vendor}</div>
                    <div>製品: ${item.params.product}</div>
                    <div>期間: ${item.params.startDate} ～ ${item.params.endDate}</div>
                    <div>検索結果: ${item.resultCount}件</div>
                    <div class="history-item-date">${new Date(item.date).toLocaleString('ja-JP')}</div>
                </div>
            `;
            historyItem.addEventListener('click', () => this.loadHistoryItem(item));
            this.searchHistory.appendChild(historyItem);
        });
    }

    loadHistoryItem(item) {
        // 検索条件を復元
        this.vendorSelect.value = item.params.vendor;
        this.productSelect.value = item.params.product;
        this.startDateInput.value = item.params.startDate;
        this.endDateInput.value = item.params.endDate;

        // モーダルを閉じて検索を実行
        this.closeHistoryModal();
        this.onSearch();
    }

    openHistoryModal() {
        this.renderSearchHistory();
        this.historyModal.style.display = 'block';
    }

    closeHistoryModal() {
        this.historyModal.style.display = 'none';
    }

    // 既存のonSearch()メソッドを修正
    async onSearch() {
        if (!this.validateSearchParams()) {
            return;
        }

        const searchParams = {
            vendor: this.vendorSelect.value,
            product: this.productSelect.value,
            startDate: this.startDateInput.value,
            endDate: this.endDateInput.value
        };

        try {
            this.showLoading();
            const vulnList = await api.getVulnOverviewList(
                searchParams.product,
                searchParams.startDate,
                searchParams.endDate
            );
            
            this.currentResults = vulnList;
            this.updateResultsView();

            // 検索履歴に追加
            this.addToHistory(searchParams);

            if (vulnList.length === 0) {
                this.showInfo('該当する脆弱性情報は見つかりませんでした');
            }
        } catch (error) {
            console.error('脆弱性情報取得エラー:', error);
            this.showError('脆弱性情報の取得に失敗しました');
        } finally {
            this.hideLoading();
        }
    }
}