function listClassesImplementsInterface(aInterface) {
    let classLoaders = Java.enumerateClassLoadersSync()
    Java.enumerateLoadedClassesSync().forEach(className => {
      for (let i = 0; i < classLoaders.length; i++) {
        let classLoader = classLoaders[i]
        Java.classFactory.loader = classLoader
        try {
          let jclass = Java.use(className).class
          let ifaces = jclass.getInterfaces().toString()
          jclass = null
          if (ifaces.indexOf(aInterface) != -1) {
            console.log(JSON.stringify({
              name: className,
              loader: classLoader.toString(),
              interfaces: ifaces
            }))
            break // we found one ClassLoader, that's enough
          }
        } catch (e) {
          // continue to next ClassLoader
        }
      }
    })
  }