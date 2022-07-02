const axios = require("axios");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const fs = require("fs");
const listFile = "./list.json";
const list = JSON.parse(fs.readFileSync(listFile));
const parser = new XMLParser();
const listEntries = {};
let total = 0;
let done = 0;
for (let i in list) {
	listEntries[i] = [];
	if (list[i].entries) {
		for (j in list[i].entries) {
			listEntries[i].push(JSON.stringify(list[i].entries[j]));
		}
	}
	++total;
}
const finish = () => {
	++done;
	if (done >= total) {
		fs.writeFileSync(listFile, JSON.stringify(list, null, "\t"));
	}
}
for (let i in list) {
	if (!list[i].url) continue;
	axios({
		url: list[i].url,
		method: "get",
		responseType: "string"
	}).then(res => {
		let xml = parser.parse(res.data);
		let entries = xml?.feed?.entry;
		if (!entries) {
			console.error("xml.feed.entry is missing", list[i].url);
			finish();
			return;
		}
		list[i].entries = [];
		for (let j in entries) {
			let a = JSON.stringify(entries[j]);
			list[i].entries.push(JSON.parse(a));
			if (!listEntries[i].includes(a)) {
				console.log(a);
			}
		}
		finish();
	}).catch(err => {
		console.error("failed", list[i], err);
		finish();
	});
}
