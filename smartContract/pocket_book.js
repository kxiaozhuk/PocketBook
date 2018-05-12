"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
        this.author = obj.author;
		this.account = obj.account;
		this.type = obj.type;
        this.remarks = obj.remarks;
        this.amount = obj.amount;
	} else {
	    this.key = "";
        this.author = "";
	    this.account = "";
	    this.type = "";
        this.remarks = "";
        this.amount = 0;
	}
};

DictItem.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var PocketBook = function () {
   LocalContractStorage.defineMapProperty(this, "accountMap");
   LocalContractStorage.defineMapProperty(this, "dataMap", {
        parse: function (text) {
            return new DictItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
   });
   LocalContractStorage.defineProperty(this, "size");

PocketBook.prototype = {
    init: function () {
        this.size = 0;
        this.accountMap.set("default", "");
    },

    save: function (key, account, type, remarks, amount) {

        key = key.trim();
        account = account.trim();
        type = type.trim();
        if (key === "" || account === ""){
            throw new Error("empty key / account");
        }
        if (type != "I" && type != "O"){
            throw new Error("invalid type");
        }
        if (remarks.length > 64 || key.length > 64){
            throw new Error("key / remarks exceed limit length")
        }
        if (amount == 0){
            throw new Error("amount is zero")
        }

        var from = Blockchain.transaction.from;
        var dictItem = this.dataMap.get(key);
        if (dictItem){
            throw new Error("book item has been occupied");
        }

        dictItem = new DictItem();
        dictItem.author = from;
        dictItem.key = key;
        dictItem.account = account;
        dictItem.type = type;
        dictItem.remarks = remarks;
        dictItem.amount = amount;

        var accountData = this.accountMap.get(account);
        if (accountData == ""){
            this.accountMap.put(account,key);
        }
        else{
            accountData += "," + key; 
        }
        this.dataMap.put(key, dictItem);
        this.size +=1;
    },

    get: function (key) {
        key = key.trim();
        if ( key === "" ) {
            throw new Error("empty key")
        }
        return this.dataMap.get(key);
    },

    len:function(){
      return this.size;
    },

    getAccount: function (account) {
        account = account.trim();
        if ( account === "" ) {
            return this.accountMap
        }
        return this.accountMap.get(account);
    }

};

module.exports = PocketBook;