/* typehints:start */
import { Application } from "../application";
import { StorageComponent } from "../game/components/storage";
import { ShapeItem } from "../game/items/shape_item";
import { Entity } from "../game/entity";
import { GameRoot } from "../game/root";
import { ShapeDefinition } from "../game/shape_definition";
/* typehints:end */

export const ACHIEVEMENTS = {
    belt500Tiles: "belt500Tiles",
    blueprint100k: "blueprint100k",
    blueprint1m: "blueprint1m",
    completeLvl26: "completeLvl26",
    cutShape: "cutShape",
    darkMode: "darkMode",
    destroy1000: "destroy1000",
    irrelevantShape: "irrelevantShape",
    level100: "level100",
    level50: "level50",
    logoBefore18: "logoBefore18",
    mam: "mam",
    mapMarkers15: "mapMarkers15",
    noBeltUpgradesUntilBp: "noBeltUpgradesUntilBp",
    noInverseRotater: "noInverseRotater",
    oldLevel17: "oldLevel17",
    openWires: "openWires",
    paintShape: "paintShape",
    place5000Wires: "place5000Wires",
    placeBlueprint: "placeBlueprint",
    placeBp1000: "placeBp1000",
    play1h: "play1h",
    play10h: "play10h",
    play20h: "play20h",
    produceLogo: "produceLogo",
    produceMsLogo: "produceMsLogo",
    produceRocket: "produceRocket",
    rotateShape: "rotateShape",
    speedrunBp30: "speedrunBp30",
    speedrunBp60: "speedrunBp60",
    speedrunBp120: "speedrunBp120",
    stack4Layers: "stack4Layers",
    stackShape: "stackShape",
    store100Unique: "store100Unique",
    storeShape: "storeShape",
    throughputBp25: "throughputBp25",
    throughputBp50: "throughputBp50",
    throughputLogo25: "throughputLogo25",
    throughputLogo50: "throughputLogo50",
    throughputRocket10: "throughputRocket10",
    throughputRocket20: "throughputRocket20",
    trash1000: "trash1000",
    unlockWires: "unlockWires",
    upgradesTier5: "upgradesTier5",
    upgradesTier8: "upgradesTier8",
};

const DARK_MODE = "dark";
const HOUR_1 = 3600; // Seconds
const HOUR_10 = HOUR_1 * 10;
const HOUR_20 = HOUR_1 * 20;
const ITEM_SHAPE = "shape";
const MINUTE_30 = 1800; // Seconds
const MINUTE_60 = MINUTE_30 * 2;
const MINUTE_120 = MINUTE_30 * 4;
const PRODUCED = "produced";
const RATE_SLICE_COUNT = 10;
const ROTATER_CCW_CODE = 12;
const ROTATER_180_CODE = 13;
const SHAPE_BP = "CbCbCbRb:CwCwCwCw";
const SHAPE_LOGO = "RuCw--Cw:----Ru--";
const SHAPE_MS_LOGO = "RgRyRbRr";
const SHAPE_OLD_LEVEL_17 = "WrRgWrRg:CwCrCwCr:SgSgSgSg";
const SHAPE_ROCKET = "CbCuCbCu:Sr------:--CrSrCr:CwCwCwCw";
const WIRE_LAYER = "wires";

export class AchievementProviderInterface {
    /** @param {Application} app */
    constructor(app) {
        this.app = app;
    }

    /**
     * Initializes the achievement provider.
     * @returns {Promise<void>}
     */
    initialize() {
        abstract;
        return Promise.reject();
    }

    /**
     * Opportunity to do additional initialization work with the GameRoot.
     * @param {GameRoot} root
     * @returns {Promise<void>}
     */
    onLoad(root) {
        abstract;
        return Promise.reject();
    }

    /** @returns {boolean} */
    hasLoaded() {
        abstract;
        return false;
    }

    /**
     * Call to activate an achievement with the provider
     * @param {string} key - Maps to an Achievement
     * @returns {Promise<void>}
     */
    activate(key) {
        abstract;
        return Promise.reject();
    }

    /**
     * Checks if achievements are supported in the current build
     * @returns {boolean}
     */
    hasAchievements() {
        abstract;
        return false;
    }
}

export class Achievement {
    /** @param {string} key - An ACHIEVEMENTS key */
    constructor(key) {
        this.key = key;
        this.activate = null;
        this.activatePromise = null;
        this.receiver = null;
        this.signal = null;
    }

    init() {

    }

    isValid() {
        return true;
    }

    isRelevant() {
        return true;
    }

    unlock() {
        if (!this.activatePromise) {
            this.activatePromise = this.activate(this.key);
        }

        return this.activatePromise;
    }
}

export class AchievementCollection {
    /**
     * @param {function} activate - Resolves when provider activation is complete
     */
    constructor(activate) {
        this.map = new Map();
        this.activate = activate;

        this.add(ACHIEVEMENTS.belt500Tiles, {
            isValid: this.isBelt500TilesValid,
            signal: "entityAdded",
        });
        this.add(ACHIEVEMENTS.blueprint100k, {
            isValid: this.isBlueprint100kValid,
            signal: "shapeDelivered",
        });
        this.add(ACHIEVEMENTS.blueprint1m, {
            isValid: this.isBlueprint1mValid,
            signal: "shapeDelivered",
        });
        this.add(ACHIEVEMENTS.completeLvl26, this.createLevelOptions(26));
        this.add(ACHIEVEMENTS.cutShape);
        this.add(ACHIEVEMENTS.darkMode, {
            isValid: this.isDarkModeValid,
        });
        this.add(ACHIEVEMENTS.destroy1000, {
            isValid: this.isDestroy1000Valid,
        });
        this.add(ACHIEVEMENTS.irrelevantShape, {
            isValid: this.isIrrelevantShapeValid,
            signal: "shapeDelivered",
        });
        this.add(ACHIEVEMENTS.level100, this.createLevelOptions(100));
        this.add(ACHIEVEMENTS.level50, this.createLevelOptions(50));
        this.add(ACHIEVEMENTS.logoBefore18, {
            isRelevant: this.isLogoBefore18Relevant,
            isValid: this.isLogoBefore18Valid,
            signal: "itemProduced"
        });
        this.add(ACHIEVEMENTS.mam, {
            isRelevant: this.isMamRelevant,
            isValid: this.isMamValid,
            signal: "storyGoalCompleted",
        });
        this.add(ACHIEVEMENTS.mapMarkers15, {
            isRelevant: this.isMapMarkers15Relevant,
            isValid: this.isMapMarkers15Valid,
        });
        this.add(ACHIEVEMENTS.noBeltUpgradesUntilBp, {
            init: this.initNoBeltUpgradesUntilBp,
            isRelevant: this.isNoBeltUpgradesUntilBpRelevant,
            isValid: this.isNoBeltUpgradesUntilBpValid,
            signal: "storyGoalCompleted",
        });
        this.add(ACHIEVEMENTS.noInverseRotater, {
            init: this.initNoInverseRotater,
            isRelevant: this.isNoInverseRotaterRelevant,
            isValid: this.isNoInverseRotaterValid,
            signal: "storyGoalCompleted",
        });
        this.add(ACHIEVEMENTS.oldLevel17, this.createShapeOptions(SHAPE_OLD_LEVEL_17));
        this.add(ACHIEVEMENTS.openWires, {
            isValid: this.isOpenWiresValid,
            signal: "editModeChanged",
        });
        this.add(ACHIEVEMENTS.paintShape);
        this.add(ACHIEVEMENTS.place5000Wires, {
            isValid: this.isPlace5000WiresValid,
        });
        this.add(ACHIEVEMENTS.placeBlueprint, {
            isValid: this.isPlaceBlueprintValid,
        });
        this.add(ACHIEVEMENTS.placeBp1000, {
            isValid: this.isPlaceBp1000Valid,
        });
        this.add(ACHIEVEMENTS.play1h, this.createTimeOptions(HOUR_1));
        this.add(ACHIEVEMENTS.play10h, this.createTimeOptions(HOUR_10));
        this.add(ACHIEVEMENTS.play20h, this.createTimeOptions(HOUR_20));
        this.add(ACHIEVEMENTS.produceLogo, this.createShapeOptions(SHAPE_LOGO));
        this.add(ACHIEVEMENTS.produceRocket, this.createShapeOptions(SHAPE_ROCKET));
        this.add(ACHIEVEMENTS.produceMsLogo, this.createShapeOptions(SHAPE_MS_LOGO));
        this.add(ACHIEVEMENTS.rotateShape);
        this.add(ACHIEVEMENTS.speedrunBp30, this.createSpeedOptions(12, MINUTE_30));
        this.add(ACHIEVEMENTS.speedrunBp60, this.createSpeedOptions(12, MINUTE_60));
        this.add(ACHIEVEMENTS.speedrunBp120, this.createSpeedOptions(12, MINUTE_120));
        this.add(ACHIEVEMENTS.stack4Layers, {
            isValid: this.isStack4LayersValid,
            signal: "itemProduced",
        });
        this.add(ACHIEVEMENTS.stackShape);
        this.add(ACHIEVEMENTS.store100Unique, {
            isRelevant: this.isStore100UniqueRelevant,
            isValid: this.isStore100UniqueValid,
            signal: "shapeDelivered",
        });
        this.add(ACHIEVEMENTS.storeShape, {
            isValid: this.isStoreShapeValid,
        });
        this.add(ACHIEVEMENTS.throughputBp25, this.createRateOptions(SHAPE_BP, 25));
        this.add(ACHIEVEMENTS.throughputBp50, this.createRateOptions(SHAPE_BP, 50));
        this.add(ACHIEVEMENTS.throughputLogo25, this.createRateOptions(SHAPE_LOGO, 25));
        this.add(ACHIEVEMENTS.throughputLogo50, this.createRateOptions(SHAPE_LOGO, 50));
        this.add(ACHIEVEMENTS.throughputRocket10, this.createRateOptions(SHAPE_ROCKET, 25));
        this.add(ACHIEVEMENTS.throughputRocket20, this.createRateOptions(SHAPE_ROCKET, 50));
        this.add(ACHIEVEMENTS.trash1000, {
            init: this.initTrash1000,
            isValid: this.isTrash1000Valid,
        });
        this.add(ACHIEVEMENTS.unlockWires, this.createLevelOptions(20));
        this.add(ACHIEVEMENTS.upgradesTier5, this.createUpgradeOptions(5));
        this.add(ACHIEVEMENTS.upgradesTier8, this.createUpgradeOptions(8));
    }

    /** @param {GameRoot} root */
    initialize(root) {
        this.root = root;
        this.root.signals.achievementCheck.add(this.unlock, this);
        this.root.signals.bulkAchievementCheck.add(this.bulkUnlock, this);

        for (let [key, achievement] of this.map.entries()) {
            if (achievement.init) {
                achievement.init();
            }

            if (!achievement.isRelevant()) {
                this.remove(key);
                continue;
            }

            if (achievement.signal) {
                achievement.receiver = this.unlock.bind(this, key);
                this.root.signals[achievement.signal].add(achievement.receiver);
            }
        }

        if (!this.hasDefaultReceivers()) {
            this.root.signals.achievementCheck.remove(this.unlock);
            this.root.signals.bulkAchievementCheck.remove(this.bulkUnlock);
        }
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {object} [options]
     * @param {function} [options.init]
     * @param {function} [options.isRelevant]
     * @param {function} [options.isValid]
     * @param {string} [options.signal]
     */
    add(key, options = {}) {
        if (G_IS_DEV) {
            assert(ACHIEVEMENTS[key], "Achievement key not found: ", key);
        }

        const achievement = new Achievement(key);

        achievement.activate = this.activate;

        if (options.init) {
            achievement.init = options.init.bind(this, achievement);
        }

        if (options.isValid) {
            achievement.isValid = options.isValid.bind(this);
        }

        if (options.isRelevant) {
            achievement.isRelevant = options.isRelevant.bind(this);
        }

        if (options.signal) {
            achievement.signal = options.signal;
        }

        this.map.set(key, achievement);
    }

    bulkUnlock() {
        for (let i = 0; i < arguments.length; i += 2) {
            this.unlock(arguments[i], arguments[i + 1]);
        }
    }

    /**
     * @param {string} key - Maps to an Achievement
     * @param {?*} data - Data received from signal dispatches for validation
     */
    unlock(key, data) {
        if (!this.map.has(key)) {
            return;
        }

        const achievement = this.map.get(key);

        if (!achievement.isValid(data)) {
            return;
        }

        achievement.unlock()
            .then(() => {
                this.onActivate(null, key);
            })
            .catch(err => {
                this.onActivate(err, key);
            });
    }

    /**
     * Cleans up after achievement activation attempt with the provider. Could
     * utilize err to retry some number of times if needed.
     * @param {?Error} err - Error is null if activation was successful
     * @param {string} key - Maps to an Achievement
     */
    onActivate(err, key) {
        this.remove(key);

        if (!this.hasDefaultReceivers()) {
            this.root.signals.achievementCheck.remove(this.unlock);
        }
    }

    /** @param {string} key - Maps to an Achievement */
    remove(key) {
        const achievement = this.map.get(key);

        if (achievement.receiver) {
            this.root.signals[achievement.signal].remove(achievement.receiver);
        }

        this.map.delete(key);
    }

    /**
     * Intended to be called on occasion to prune achievements that became
     * irrelevant during a play session.
     */
    clean() {
        for (let [key, achievement] of this.map.entries()) {
            if (!achievement.activatePromise && !achievement.isRelevant()) {
                this.remove(key);
            }
        }
    }

    /**
     * Check if the collection-level achievementCheck receivers are still
     * necessary.
     */
    hasDefaultReceivers() {
        if (!this.map.size) {
            return false;
        }

        for (let achievement of this.map.values()) {
            if (!achievement.signal) {
                return true;
            }
        }

        return false;
    }

    /*
     * Remaining methods exist to extend Achievement instances within the
     * collection.
     */

    hasAllUpgradesAtTier(tier) {
        const upgrades = this.root.gameMode.getUpgrades();

        for (let upgradeId in upgrades) {
            if (this.root.hubGoals.getUpgradeLevel(upgradeId) < tier - 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {ShapeItem} item
     * @param {string} shape
     * @returns {boolean}
     */
    isShape(item, shape) {
        return item.getItemType() === ITEM_SHAPE && item.definition.getHash() === shape;
    }

    createLevelOptions(level) {
        return {
            isRelevant: () => this.root.hubGoals.level < level,
            isValid: (currentLevel) => currentLevel === level,
            signal: "storyGoalCompleted",
        };
    }

    createRateOptions(shape, rate) {
        return {
            isValid: () => {
                return this.root.productionAnalytics.getCurrentShapeRate(
                    PRODUCED,
                    this.root.shapeDefinitionMgr.getShapeFromShortKey(shape)
                ) >= rate;
            }
        };
    }

    createShapeOptions(shape) {
        return {
            isValid: (item) => this.isShape(item, shape),
            signal: "itemProduced",
        };
    }

    createSpeedOptions(level, time) {
        return {
            isRelevant: () => this.root.hubGoals.level <= level && this.root.time.now() < time,
            isValid: (currentLevel) => currentLevel === level && this.root.time.now() < time,
            signal: "storyGoalCompleted",
        };
    }

    createTimeOptions(duration) {
        return {
            isRelevant: () => this.root.time.now() < duration,
            isValid: () => this.root.time.now() >= duration,
        };
    }

    createUpgradeOptions(tier) {
        return {
            isRelevant: () => !this.hasAllUpgradesAtTier(tier),
            isValid: () => this.hasAllUpgradesAtTier(tier),
            signal: "upgradePurchased",
        };
    }

    /** @param {Entity} entity @returns {boolean} */
    isBelt500TilesValid(entity) {
        return entity.components.Belt && entity.components.Belt.assignedPath.totalLength >= 500;
    }

    /** @param {ShapeDefinition} definition @returns {boolean} */
    isBlueprint100kValid(definition) {
        return (
            definition.cachedHash === SHAPE_BP &&
            this.root.hubGoals.storedShapes[SHAPE_BP] >= 100000
        );
    }

    /** @param {ShapeDefinition} definition @returns {boolean} */
    isBlueprint1mValid(definition) {
        return (
            definition.cachedHash === SHAPE_BP &&
            this.root.hubGoals.storedShapes[SHAPE_BP] >= 1000000
        );
    }

    /** @returns {boolean} */
    isDarkModeValid() {
        return this.root.app.settings.currentData.settings.theme === DARK_MODE;
    }

    /** @param {number} count @returns {boolean} */
    isDestroy1000Valid(count) {
        return count >= 1000;
    }

    /** @param {ShapeDefinition} definition @returns {boolean} */
    isIrrelevantShapeValid(definition) {
        if (definition.cachedHash === this.root.hubGoals.currentGoal.definition.cachedHash) {
            return false;
        }

        const upgrades = this.root.gameMode.getUpgrades();
        for (let upgradeId in upgrades) {
            const currentTier = this.root.hubGoals.getUpgradeLevel(upgradeId);
            const requiredShapes = upgrades[upgradeId][currentTier].required;

            for (let i = 0; i < requiredShapes.length; i++) {
                if (definition.cachedHash === requiredShapes[i].shape) {
                    return false;
                }
            }
        }

        return true;
    }

    /** @returns {boolean} */
    isLogoBefore18Relevant() {
        return this.root.hubGoals.level < 18;
    }

    /** @param {ShapeItem} item @returns {boolean} */
    isLogoBefore18Valid(item) {
        return this.root.hubGoals.level < 18 && this.isShape(item, SHAPE_LOGO);
    }

    initMam() {
        const stats = this.root.savegame.currentData.stats;

        if (stats.failedMam === true) {
            return;
        }

        if (this.root.hubGoals.level === 26 && stats.failedMam === false) {
            return;
        }

        stats.failedMam = this.root.hubGoals.level < 26;
    }

    /** @returns {boolean} */
    isMamRelevant() {
        return this.root.hubGoals.level <= 26 && !this.root.savegame.currentData.stats.failedMam;
    }

    /** @params {number} level @returns {boolean} */
    isMamValid(level) {
        return level === 27 && !this.root.savegame.currentData.stats.failedMam;
    }

    /** @returns {boolean} */
    isMapMarkers15Relevant() {
        return this.root.hud.parts.waypoints.waypoints.length < 16; // 16 - HUB
    }

    /** @param {number} count @returns {boolean} */
    isMapMarkers15Valid(count) {
        return count === 15;
    }

    initNoBeltUpgradesUntilBp() {
        const stats = this.root.savegame.currentData.stats;

        if (stats.upgradedBelt === true) {
            return;
        }

        stats.upgradedBelt = this.root.hubGoals.upgradeLevels.belt > 0;
    }

    /** @returns {boolean} */
    isNoBeltUpgradesUntilBpRelevant() {
        return this.root.hubGoals.level <= 12 && this.root.hubGoals.upgradeLevels.belt === 0;
    }

    /** @params {number} level @returns {boolean} */
    isNoBeltUpgradesUntilBpValid(level) {
        return level === 12 && this.root.hubGoals.upgradeLevels.belt === 0;
    }

    initNoInverseRotater() {
        if (this.root.savegame.currentData.stats.usedInverseRotater === true) {
            return;
        }

        const entities = this.root.entityMgr.componentToEntity.StaticMapEntity;

        let usedInverseRotater = false;
        for (var i = 0; i < entities.length; i++) {
            const entity = entities[i].components.StaticMapEntity;

            if (entity.code === ROTATER_CCW_CODE || entity.code === ROTATER_180_CODE) {
                usedInverseRotater = true;
                break;
            }
        }

        this.root.savegame.currentData.stats.usedInverseRotater = usedInverseRotater;
    }

    /** @returns {boolean} */
    isNoInverseRotaterRelevant() {
        return this.root.hubGoals.level < 14 &&
            !this.root.savegame.currentData.stats.usedInverseRotater;
    }

    /** @param {number} level @returns {boolean} */
    isNoInverseRotaterValid(level) {
        return level === 14 && !this.root.savegame.currentData.stats.usedInverseRotater;
    }

    /** @param {string} currentLayer @returns {boolean} */
    isOpenWiresValid(currentLayer) {
        return currentLayer === WIRE_LAYER;
    }

    /** @param {Entity} entity @returns {boolean} */
    isPlace5000WiresValid(entity) {
        return (
            entity.components.Wire &&
            entity.registered &&
            entity.root.entityMgr.componentToEntity.Wire.length === 5000
        );
    }

    /** @param {number} count @returns {boolean} */
    isPlaceBlueprintValid(count) {
        return count != 0;
    }

    /** @param {number} count @returns {boolean} */
    isPlaceBp1000Valid(count) {
        return count >= 1000;
    }

    /** @param {ShapeItem} item @returns {boolean} */
    isStack4LayersValid(item) {
        return item.getItemType() === ITEM_SHAPE && item.definition.layers.length === 4;
    }

    /** @returns {boolean} */
    isStore100UniqueRelevant() {
        return Object.keys(this.root.hubGoals.storedShapes).length < 100;
    }

    /** @returns {boolean} */
    isStore100UniqueValid() {
        return Object.keys(this.root.hubGoals.storedShapes).length === 100;
    }

    /** @returns {boolean} */
    isStoreShapeValid() {
        const entities = this.root.systemMgr.systems.storage.allEntities;

        if (entities.length === 0) {
            return false;
        }

        for (var i = 0; i < entities.length; i++) {
            if (entities[i].components.Storage.storedCount > 0) {
                return true;
            }
        }

        return false;
    }

    initTrash1000() {
        if (Number(this.root.savegame.currentData.stats.trashedCount)) {
            return;
        }

        this.root.savegame.currentData.stats.trashedCount = 0;
    }

    /** @params {number} count @returns {boolean} */
    isTrash1000Valid(count) {
        this.root.savegame.currentData.stats.trashedCount += count;

        return this.root.savegame.currentData.stats.trashedCount >= 1000;
    }
}
