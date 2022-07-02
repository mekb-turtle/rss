const axios = require("axios");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const fs = require("fs");
const path = require("path");
const listFile = path.join(__dirname, "list.json");
console.log("reading", listFile);
const list = JSON.parse(fs.readFileSync(listFile));
const parser = new XMLParser();
const listEntries = {};
const newEntries = {};
let total = 0;
let done = 0;
for (let i in list) {
	listEntries[i] = [];
	if (list[i].entries) {
		for (j in list[i].entries) {
			listEntries[i].push(JSON.stringify(list[i].entries[j]));
		}
	} else {
		newEntries[i] = true;
	}
	++total;
}
const finish = () => {
	++done;
	if (done >= total) {
		console.log("writing", listFile);
		let z = JSON.stringify(list, null, "\t");
		z = z.replace(/\t{3}\{\n(\t{3}[^\{].*\n)+\t{3}\}/g, e => {
			e = JSON.stringify(JSON.parse(e));
			return "\t\t\t" + e;
		});
		fs.writeFileSync(listFile, z);
		process.exit(0);
	}
}
for (let i in list) {
	if (!list[i].url) {
		console.error("not a url", list[i].url);
		continue;
	}
	console.log("fetching", list[i].url);
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
			if (!newEntries[i]) {
				if (!listEntries[i].includes(a)) {
					console.log(a);
				}
			}
		}
		finish();
	}).catch(err => {
		console.error("failed", list[i].url, err);
		finish();
	});
}
