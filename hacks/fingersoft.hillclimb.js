/*
Commands:
  NoAds() - Unlock remove ads features.
  MaxAll() - Max out coins, gems, and paints.
  UnlockBundle(998) - Unlock all bundle.
*/

Java.perform(function() {
    var InAppPurchaseStore = Java.use("com.fingersoft.game.InAppPurchaseStore");
    var MainActivity = Java.use("com.fingersoft.game.MainActivity");
    function MaxAll() {
        InAppPurchaseStore.mCoins.value = 999999999;
        InAppPurchaseStore.mGems.value = 999999999; 
        InAppPurchaseStore.mPaints.value = 999999999;  
        InAppPurchaseStore.mIAPError.value = 0;
        console.log("Maxed out mCoins, mGems, and mPaints");
    }
    function NoAds () {
        InAppPurchaseStore.mAdFree.value = 1;
        InAppPurchaseStore.mIAPError.value = 0;
        console.log("Set mAdFree to 1 and mIAPError to 0");
    }
    function UnlockBundle(value) {
        var bundleValues = {
            10: "Trick",
            11: "Legendary",
            12: "Moon",
            13: "Highway",
            14: "Factory",
            15: "Bootcamp",
            16: "Hippie",
            17: "Forest",
            18: "Nuclear",
            19: "Mud",
            20: "Chopper",
            21: "Xmas",
            22: "AirCar",
            996: "UnlockVehicles",
            997: "UnlockStages",
            998: "UnlockVehiclesStages"
        };
        if (bundleValues.hasOwnProperty(value)) {
            InAppPurchaseStore.mBundle.value = value;
            console.log("Set mBundle to " + value + " (" + bundleValues[value] + ")");
        } else {
            console.log("Invalid mBundle value: " + value);
        }
    }
    global.NoAds = NoAds;
    global.MaxAll = MaxAll;
    global.UnlockBundle = UnlockBundle;
});
