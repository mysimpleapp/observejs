(function(){
// Create observable
O = Observable = function(obj) {
	var observers = {}
	// create Observable as Proxy of given obj
	var obs = new Proxy(obj, {
		// Add trap for set
		set: function(target, attr, val) {
			var oldVal = target[attr]
			// standard behaviour
			target[attr] = val
			// trigger change if value changed
			if(oldVal!==val) triggerChange(obs, attr, oldVal, val);
			return val
		},
		// add trap for delete
		deleteProperty: function(target, attr) {
			var oldVal = target[attr]
			// standard behaviour
			delete target[attr]
			// trigger change if value existed
			if(oldVal!==undefined) triggerChange(obs, attr, oldVal)
		}
	})
	// Add _observers property
	addHiddenProperty(obs, "_observers", observers)
	return obs
}
// Observe observables
Observe = function(obs, attrs, next) {
	if(!isObservable(obs)) return
	var observers = obs._observers
	// check if it a deep change
	var attrsParsed = parseAttrs(attrs), attr = attrsParsed[0], sonAttrs = attrsParsed[1]
	if(attr==="**") sonAttrs="**"
	if(!sonAttrs) {
		// no deep change, create "observer" with given "next"
		var obsObserver = new Observer(obs, attr, next)
	} else {
		// special observer for "**": trigger next at each change
		if(attr==="**") {
			var attr = "*"
			var obsObserver = new Observer(obs, attr, function(changedObs, changedAttr, oldVal, newVal) {
				// Add observation to new son
				this.setSonObserver(changedAttr, Observe(newVal, sonAttrs, next))
				// call next
				next(changedObs, changedAttr, oldVal, newVal)
			})
		// otherwise, trigger next only if targeted deep attr has changed
		} else {
			var obsObserver = new Observer(obs, attr, function(changedObs, changedAttr, oldVal, newVal) {
				// Add observation to new son
				this.setSonObserver(changedAttr, Observe(newVal, sonAttrs, next))
				// check if the deep value has changed, if so call "next"
				var oldDeepVal = getDeepVal(oldVal, sonAttrs)
				var newDeepVal = getDeepVal(newVal, sonAttrs)
				if(oldDeepVal!==newDeepVal) next(changedObs, changedAttr, oldVal, newVal)
			})
		}
		// Add observation to son(s)
		if(attr!=="*")
			obsObserver.setSonObserver(attr, Observe(obs[attr], sonAttrs, next))
		else
			for(var sAttr in obs)
				obsObserver.setSonObserver(sAttr, Observe(obs[sAttr], sonAttrs, next))
	}
	// Fill "_observers"
	var attrObservers = observers[attr]
	if(!attrObservers) attrObservers = observers[attr] = []
	attrObservers.push(obsObserver)
	return obsObserver
}
// Observer object
var Observer = function(obs, attr, next) {
	this.obs = obs
	this.attr = attr
	this.next = next
	// stop observation
	this.stop = function(){
		var obs = this.obs
		if(!isObservable(obs)) return
		// find this in _observers
		var observers = obs._observers
		var attrObservers = observers[this.attr]
		if(!attrObservers) return
		var index = attrObservers.indexOf(this)
		// if found, remove it from _observers
		if(index!==-1) attrObservers.splice(index)
		// if there is sonObservers, stop them all
		var sonObservers = this.sonObservers
		if(sonObservers)
			for(var sonAttr in sonObservers)
				sonObservers[sonAttr].stop()
	}
	this.setSonObserver = function(attr, sonObserver) {
		if(!sonObserver) return
		// create sonObservers map (if needed)
		var sonObservers = this.sonObservers
		if(!sonObservers) sonObservers = this.sonObservers = {}
		// stop previous sonObserver on same attr (if any)
		var oldSonObserver = sonObservers[attr]
		if(oldSonObserver) oldSonObserver.stop()
		// fill sonObservers
		sonObservers[attr] = sonObserver
	}
}
// Add property that is not visible by a "for in"
var addHiddenProperty = function(obj, attr, method) {
	Object.defineProperty(obj, attr, {
		enumerable: false,
		configurable: true,
		writable: true,
		value: method
	})
}
// Trigger change information
var triggerChange = function(obs, attr, oldVal, newVal) {
	var observers = obs._observers
	// Specigic attr observers
	callObservers(observers[attr], obs, attr, oldVal, newVal)
	// All attrs observers
	callObservers(observers['*'], obs, attr, oldVal, newVal)
}
var callObservers = function(observers, obs, attr, oldVal, newVal){
	if(!observers) return
	for(var i=0, len=observers.length; i<len; ++i)
		observers[i].next(obs, attr, oldVal, newVal)
}
// Parse "a.a.a" into ["a","a.a"]
var parseAttrs = function(attrs) {
	var firstPoint = attrs.indexOf(".")
	if(firstPoint===-1) return [attrs]
	else return [attrs.substr(0, firstPoint), attrs.substr(firstPoint+1)]
}
// get value of obj["a.a"]
var getDeepVal = function(obj, attrs) {
	if(!isObject(obj)) return undefined
	var attrsParsed = parseAttrs(attrs)
	if(!attrsParsed[1]) return obj[attrs]
	else return getDeepVal(obj[attrsParsed[0]], attrsParsed[1])
}
// Check if variable is an Object
var isObject = function(obs) {
	return (obs && typeof obs==="object")
}
// Check if variable is an Observable
var isObservable = function(obs) {
	return (isObject(obs) && obs._observers!==undefined)
}
})()