class UI {
    constructor() {
        // 既存のプロパティに追加
        this.resultsControls = document.getElementById('resultsControls');
        this.sortBySelect = document.getElementById('sortBy');
        this.filterTextInput = document.getElementById('filterText');
        this.exportBtn = document.getElementById('exportBtn');
        this.currentResults = [];

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 既存のイベントリスナーに追加
        this.sortBySelect.addEventListener('change', () => this.updateResultsView());
        this.filterTextInput.addEventListener('input', () => this.updateResultsView());
        this.exportBtn.addEventListener('click', () => this.exportResults());
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

    async onSearch() {
        if (!this.validateSearchParams()) {
            return;
        }

        try {
            this.showLoading();
            const vulnList = await api.getVulnOverviewList(
                this.productSelect.value,
                this.startDateInput.value,
                this.endDateInput.value
            );
            
            this.currentResults = vulnList;
            this.updateResultsView();

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

    exportResults() {
        const filteredResults = this.filterResults(this.currentResults);
        const sortedResults = this.sortResults(filteredResults);
        
        // CSVフォーマットに変換
        const csvContent = [
            ['タイトル', '説明', '公開日', 'リンク'].join(','),
            ...sortedResults.map(result => [
                `"${result.title.replace(/"/g, '""')}"`,
                `"${result.description.replace(/"/g, '""')}"`,
                result.published,
                result.link
            ].join(','))
        ].join('\n');

        // ダウンロード用のリンクを作成
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `vulnerability_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
}