(function(){
Observe = function(obj, arg1, arg2) {
	var type = typeof arg1;
	if(type=="function") Object.observe(obj, arg1);
	else {
		var check = null;
		if(type=="string") check = checkString;
		else if(type=="object") check = (arg1.length===undefined) ? checkObject : checkArray;
		if(check) conditonalObserve(check, obj, arg1, arg2);
	}
};
var checkString = function(change, str) { return change.name===str; }
var checkArray = function(change, arr) { return arr.indexOf(change.name)!==-1; }
var checkObject = function(change, obj) { var name=change.name; return (name in obj) && obj[name]===change.object[name]; }
var conditonalObserve = function(check, obj, val, callback) {
	Object.observe(obj, function(changes) {
		for(var c=0, len=changes.length; c<len; ++c) {
			if(check(changes[c], val)) {
				callback();
				break;
			}
		}
	});
}
})()
