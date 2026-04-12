"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCSV = void 0;
const toCSV = (data) => {
    if (!data.length)
        return '';
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined)
            return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
    }).join(','));
    return [headers.join(','), ...rows].join('\n');
};
exports.toCSV = toCSV;
//# sourceMappingURL=csv.js.map