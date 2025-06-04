const API_BASE_URL = 'https://jvndb.jvn.jp/myjvn';
const CORS_PROXY = 'https://corsproxy.io/?';

class MyJVNAPI {
    async getVendorList(keyword = '') {
        const params = new URLSearchParams({
            method: 'getVendorList',
            keyword: keyword
        });
        
        const response = await fetch(`${CORS_PROXY}${API_BASE_URL}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const xmlText = await response.text();
        return this.parseVendorList(xmlText);
    }

    async getProductList(vendorId, keyword = '') {
        const params = new URLSearchParams({
            method: 'getProductList',
            vendor: vendorId,
            keyword: keyword
        });

        const response = await fetch(`${CORS_PROXY}${API_BASE_URL}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const xmlText = await response.text();
        return this.parseProductList(xmlText);
    }

    async getVulnOverviewList(productId, startDate, endDate) {
        const params = new URLSearchParams({
            method: 'getVulnOverviewList',
            productId: productId,
            datePublished: startDate,
            datePublishedEnd: endDate
        });

        const response = await fetch(`${CORS_PROXY}${API_BASE_URL}?${params}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const xmlText = await response.text();
        return this.parseVulnOverviewList(xmlText);
    }

    parseVendorList(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const vendors = xmlDoc.getElementsByTagName('Vendor');
        
        return Array.from(vendors).map(vendor => ({
            id: vendor.getAttribute('vid'),
            name: vendor.getAttribute('vname')
        }));
    }

    parseProductList(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const products = xmlDoc.getElementsByTagName('Product');
        
        return Array.from(products).map(product => ({
            id: product.getAttribute('pid'),
            name: product.getAttribute('pname')
        }));
    }

    parseVulnOverviewList(xmlText) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');
        
        return Array.from(items).map(item => ({
            title: item.getElementsByTagName('title')[0]?.textContent,
            link: item.getElementsByTagName('link')[0]?.textContent,
            description: item.getElementsByTagName('description')[0]?.textContent,
            published: item.getElementsByTagName('published')[0]?.textContent
        }));
    }
}

const api = new MyJVNAPI();
