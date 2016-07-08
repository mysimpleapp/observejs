# observejs
Light javascript library based on javascript Proxy giving the possibility to create Observable objects in which it is possible to track any change.

## Create Observable
To ___create observables___, use the following syntax
```javascript
# The short way
var obs = O({})

# The full way
var obs = Observable({})
```

You can directly include some properties
```javascript
var obs = O({a:1, b:2})
```

You can create observables containing observables
```javascript
var obs = O({a: O({b:1}) })
```

## Observe changes in observables
To observe the change of an observable ___specific property___, use the following syntax:
```javascript
var obs = O({a:1})

Observe(obs, "a", function(obs, attr, oldVal, newVal){
	console.log("The property", attr, "of observable", obs, "was changed from", oldVal, "to", newVal)
})

obs.a = 2
> "The property 'a' of observable 'obs' was changed from '1' to '2'"
```

You can observe the changes of ___any property___ of the observable, with this syntax:
```javascript
Observe(obs, "*", callback)
```

You can observe the changes of ___children specific property___ (providing there are also observables), with this sysntax:
```javascript
var obs = O({a: O({b: O({c:1}) }) })
Observe(obs, "a.b.c", callback)
```

You can observe the changes of __any children property__ (providing children are also observables), with this sysntax:
```javascript
Observe(obs, "**", callback)
```

## Stop observation
You can ___stop observation___, using this syntax:
```javascript
var observer = Observe(obs, "a", callback)
observer.stop()
```