import "frida-il2cpp-bridge";

Il2Cpp.perform(() => {
    console.log("Frida Loaded in Unity Il2Cpp Version " + Il2Cpp.unityVersion);
    const AssemblyCSharp = Il2Cpp.domain.assembly("Assembly-CSharp").image;
    const allClasses = [
      //"FGOL.IAP.ReconcilableIAP",
      //"FGOL.IAP.IAPTransaction",
      //"FGOL.IAP.IRemoteStoreProductInfo",
      //"FGOL.IAP.RemoteStoreProductInfo",
      //"FGOL.IAP.IIAPVerifier",
      //"Ubisoft.Orion.MonetisationCore.Transaction",
      //"Ubisoft.Orion.MonetisationCore.GoogleProduct",
      //"Ubisoft.Orion.MonetisationCore.ProductGoogle",
      //"Ubisoft.Orion.MonetisationCore.TransactionGoogle",
      //"Ubisoft.Orion.MonetisationCore.GoogleTransaction",
      //"FGOL.IAP.IAPProvider_GooglePlay",
      //"FGOL.IAP.IAPResult",
      //"FGOL.IAP.InAppPurchase",
      //"FGOL.IAP.TransactionVerificationStatus",
      //"FGOL.IAP.CoinsLocalStoreProduct",
      //"FGOL.IAP.GemsLocalStoreProduct",
      //"FGOL.IAP.IAPTransactionHistory",
      //"FGOL.IAP.IAPVerifier_Amazon",
      //"FGOL.IAP.IAPVerifier_Facebook",
      //"FGOL.IAP.IAPVerifier_GooglePlay",
      //"FGOL.IAP.IAPVerifier_Houston",
      //"FGOL.IAP.IAPVerifier_iOS",
      //"FGOL.IAP.IAPVerifier_Offline",
      //"FGOL.IAP.IAPVerifier_UbiBCN",
      //"FGOL.IAP.IIAPProvider",
      //"FGOL.IAP.IIAPTransaction",
      //"FGOL.IAP.IIAPTransactionHistory",
      //"FGOL.IAP.ILocalStoreProduct",
      //"FGOL.IAP.ReconcilableRestorer",
      //"FGOL.IAP.SharkOfferLocalStoreProduct",
      //"FGOL.AbilityControl",
      //"FGOL.AbilityControlAI",
      //"FGOL.AndroidInstallerPackageNameUtils",
      //"FGOL.AtomicBreathAbility",
      //"FGOL.AtomicBreathAbilityBehemothEvolved",
      //"FGOL.BlowholeAbility",
      //"FGOL.CrossWallsAbility",
      //"FGOL.DinamicColliderAbility",
      //"IncomingRewardView",
      //"CheatDetector",
      //"FGOL.EmissionFading",
      "FGOL.FGOLLogger",
      //"CollectablesManager",
      //"CollectableItemToSpawn",
      //"Eater",
      //"Edible",
      //"SharkDeath",
      //"Menu_InfoStats",
      //"Globals",
      //"AGSScore",
      //"SharkStatsContent",
      //"SharksCarouselManager",
      //"GameTrigger",
      //"AdsFreeOfferPackManager",
      //"Menu_Shark",
      //"CurrencyManager",
      //"SharkStats",
      //"PowerUpsManager",
      //"PowerUpMegaRush",
      //"PowerUpAbilityShield",
      //"GameStats",
      //"GameLogic",
      //"Rewards.RewardsConstants",
      //"CoinsDealer",
      //"CoinPrize"
    ];
    allClasses.forEach(className => {
        try {
            const cls = AssemblyCSharp.class(className);
            if (cls) {
                //console.log(`Tracing and hooking methods for class: ${className}`);
                Il2Cpp.trace(true).classes(cls).and().attach();
            } else {
                console.log(`Class ${className} not found in Assembly-CSharp.`);
            }
        } catch (error) {
            console.error(`Error hooking class ${className}:`, error);
        }
    });
    Interceptor.attach(AssemblyCSharp.class('SharkStats').method('set_PremiumCurrency').virtualAddress, {
      onEnter(args) {
          try {
              args[1] = ptr(currency);
              for (let i = 0; i < 15; i++) {
                  console.log(`- Arg ${i}: ${args[i].toInt32()}`);
              }
          } catch (error) {
              console.error('Error in onEnter:', error);
          }
      },
    });
});

import { getActivity, sleep, ensureModuleInitialized, JavaIl2cppPerform } from './util.js';
type Il2CppThis = Il2Cpp.Class | Il2Cpp.Object;
const APP_MAIN_ACTIVITY = 'com.unity3d.player.UnityPlayerActivity';
const modules = ['libil2cpp.so', 'libunity.so', 'libmain.so'];

JavaIl2cppPerform(async () => {
  await sleep(1000);
  await ensureModuleInitialized(...modules);
  const mainActivity = await getActivity(APP_MAIN_ACTIVITY);
  if (!mainActivity) throw new Error('Failed to get main activity');
  // load   .dex in app data /sdcard/Android/data/com.app.name/files/menu.dex
    const appExternalFilesDir = mainActivity.getApplicationContext().getExternalFilesDir(''); 
    var menuDexPath = appExternalFilesDir + '/menu.dex';
    if(Java.use('java.io.File').$new(menuDexPath).exists()) {
        Java.openClassFile(menuDexPath).load();
    }
  main(mainActivity).catch((error) => console.error(error));
});

async function main(mainActivity: Java.Wrapper) {
  const Menu = Java.use('com.x3ric.fmenu.Menu');
  const Config = Java.use('com.x3ric.fmenu.Config');
  const Bool = Java.use('com.x3ric.fmenu.PBoolean');
  const Int = Java.use('com.x3ric.fmenu.PInteger');
  // Getting unity classes
  const AssemblyCSharp = Il2Cpp.domain.assembly('Assembly-CSharp');
  //const IAPResult = AssemblyCSharp.image.class('FGOL.IAP.IAPResult');
  const SharkStats = AssemblyCSharp.image.class('SharkStats');
  // Load saved currency value from shared preferences
  const prefs = mainActivity.getApplicationContext().getSharedPreferences('MyPrefs', 0);
  let savedCurrency = prefs.getInt('currency', 0);
  // Creating state variables
  const currency = Int.of(savedCurrency);
  const iap = Bool.of(false);
  // Creating a custom config
  const config = Config.$new();
  config.MENU_TITLE.value = 'Hungry Shark Evolution';
  config.MENU_SUBTITLE.value = 'Have fun!';
  const menu = Menu.$new(mainActivity, config);
  // Building menu
  menu.InputNum('Coins', currency);
  menu.Switch('IAP', iap);
  // Hooking methods
  if (iap.get()) {
    //Il2Cpp.domain.assembly('Assembly-CSharp').image.class('FGOL.IAP.IAPProvider_GooglePlay').field('UNSPECIFIED_STATE').value = 1;
    //IAPResult.method('ToString').implementation = function (...args) {
    //  args[1] = " 2:Success, SDK Error: \"\""
    //  this.method('ToString').invoke(...args);
    //  return true;
    //}; 
    //IAPResult.method('get_IsSuccess').implementation = function (...args) {
    //  console.log('Bypassing IAP: get_IsSuccess method called');
    //  this.method('get_IsSuccess').invoke(...args);
    //  return true;
    //};      
  }

  SharkStats.method('get_PremiumCurrency').implementation = function () {
    if (currency.get() > 0) return currency.get();
    return this.method('get_PremiumCurrency').invoke();
  };

  SharkStats.method('get_Currency').implementation = function () {
    if (currency.get() > 0) return currency.get();
    return this.method('get_Currency').invoke();
  };

  // Periodically save currency value to shared preferences
    setInterval(() => {
      if(savedCurrency != currency.get()){
        const editor = prefs.edit();
        editor.putInt('currency', currency.get());
        editor.commit();
      }
    }, 5000); // Save every 5 seconds
  Java.scheduleOnMainThread(() => {
    menu.attach();
  });
}
