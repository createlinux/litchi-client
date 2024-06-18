import Ajax from "./Ajax.js";

const Area = {
    getAll() {
        return Ajax.get('https://public-api.lizhiruanjian.com/api/v1/areas')
    },
    getProvinces() {
        return Ajax.get('https://public-api.lizhiruanjian.com/api/v1/areas?level=1')
    },
    getCities() {
        return Ajax.get('https://public-api.lizhiruanjian.com/api/v1/areas?level=2')
    }
}

export default Area