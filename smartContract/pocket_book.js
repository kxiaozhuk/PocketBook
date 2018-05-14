"use strict";

var DictItem = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.key = obj.key;
        this.author = obj.author;
		this.account = obj.account;
		this.types = obj.types;
        this.remarks = obj.remarks;
        this.amount = obj.amount;
        this.create = obj.create;
	} else {
	    this.key = "";
        this.author = "";
	    this.account = "";
	    this.types = "";
        this.remarks = "";
        this.amount = 0;
        this.create = Date();
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
};

PocketBook.prototype = {
    init: function () {
        this.size = 0;
        this.accountMap.set("default", "");
    },

    save: function (key, account, types, remarks, amount) {

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
        dictItem.types = types;
        dictItem.remarks = remarks;
        dictItem.amount = amount;
        dictItem.create = Date();

        var accountData = this.accountMap.get(account);
        if (accountData == ""){
            this.accountMap.put(account,key);
        }
        else{
            accountData += "," + key;
            this.accountMap.put(account,accountData);
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
    },

    getByAccount: function (account) {
        account = account.trim();
        if ( account === "" ) {
            throw new Error("empty account")
        }
        var keys = this.accountMap.get(account);
        if (keys == ""){
            return "[]";
        }else{
            var keyArr = keys.split(",");
            var dataStr = "[";
            for (var i=0;i<keyArr.length;i++)
            {
                var item = this.dataMap.get(keyArr[i]);
                dataStr += item.toString() + ",";
            }
            return dataStr.substring(0,dataStr.length - 1) + "]";
        }
    }

};

module.exports = PocketBook;