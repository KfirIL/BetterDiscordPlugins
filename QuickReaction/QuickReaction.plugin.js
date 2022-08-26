/**
 * @name QuickReaction
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website 
 * @source https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/QuickReaction.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {"info":{"name":"QuickReaction","authors":[{"name":"Kfir","discord_id":"302774260236025857","github_username":"KfirIL"}],"version":"1.0.0","description":"Lets you quickly use selected reaction.","github":"","github_raw":"https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/QuickReaction.plugin.js"},"changelog":[{"title":"Release","items":["Thanks For Installing!"]}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {
    const {Patcher, Logger, WebpackModules, DiscordModules, Settings, Tooltip} = Library;
    const {React} = DiscordModules;
    return class QuickReaction extends Plugin {
        constructor() {
            super();
            this.quickReaction = {
                name: BdApi.loadData(config.info.name, "Emoji Name"),
                id: BdApi.loadData(config.info.name, "Emoji Id")
            };
            if(this.quickReaction.name === undefined) this.quickReaction.name = "😁";
            this.emojis = BdApi.loadData(config.info.name, "Emojis");
        }

        onStart() { 
            Patcher.before(Logger, "log", (t, a) => {
                a[0] = "Patched Message: " + a[0];
            });
            const miniPopover = WebpackModules.getModule(m => m?.default?.displayName == 'MiniPopover');
            Patcher.after(miniPopover, "default", (_, args, ret) => {
                const retProps = ret.props.children;
                if (!(retProps && retProps[1].props) || !retProps[1].props.canReact) return;
                const reaction = WebpackModules.getByProps('addReaction', 'removeReaction');
                const toolRef = (e) => { 
                    if(e !== null)
                    new Tooltip(e, "Quick Reaction", {style: "grey"});
                }
                const emojiPos = (emoji) => {
                    if(this.emojis[emoji] === undefined) {
                        if(this.emojis['arms'][emoji] === undefined) return this.emojis['default'];
                        else return this.emojis['arms'][emoji]; 
                    }
                    else return this.emojis[emoji];
                }
                const emojiUrl = (emoji) => {
                    if(this.emojis[emoji] === undefined) {
                        if(this.emojis['arms'][emoji] === undefined) return this.emojis['url'];
                        else return this.emojis['arms']['url']; 
                    }
                    else return this.emojis['url'];
                }
                const emojiBackSize = (emoji) => {
                    if(this.emojis[emoji] === undefined) {
                        if(this.emojis['arms'][emoji] === undefined) return this.emojis['backgroundSize'];
                        else return this.emojis['arms']['backgroundSize']; 
                    }
                    else return this.emojis['backgroundSize'];
                }

                class ToolTip extends React.Component {
                    constructor(props) {
                        super(props);
                        props.allowOverflow = false,
                        props.color = "primary",
                        props.forceOpen,
                        props.hideOnClick = true,
                        props.position = "top",
                        props.shouldShow = true,
                        props.spacing = 8,
                        props.text = "Quick Reaction"
                    }
                    render() {
                        const q = new QuickReaction();
                        class Button extends React.Component{
                            render() {
                                return React.createElement("div", {
                                    className: "button-3bklZh",
                                    "aria-label": "Quick Reaction",
                                    role: "button",
                                    ref: toolRef,
                                    tabindex: "0",
                                    onClick: () => {
                                        if(q.emojis === undefined) return BdApi.showToast("You MUST first select an emoji in the plugin's settings.", {type: 'danger'});
                                        const messageReactions = retProps[2].props.message.reactions;
                                        function add() {reaction.addReaction(retProps[2].props.channel.id, retProps[2].props.message.id, q.quickReaction)}
                                        function remove() {reaction.removeReaction(retProps[2].props.channel.id, retProps[2].props.message.id, q.quickReaction)}
                                        if(messageReactions.length === 0) return add();
                                        for(let i = 0; i < messageReactions.length; i++) {
                                            if(messageReactions[i].me && messageReactions[i].emoji.name === q.quickReaction.name && messageReactions[i].emoji.id === q.quickReaction.id) return remove();
                                            else if(i === messageReactions.length -1) add();
                                        };
                                    }
                                  }, React.createElement("div", {
                                    className: "emojiSpriteImage-3ykvhZ",
                                    style: {
                                        "background-image": emojiUrl(q.quickReaction.name),
                                        "background-position": emojiPos(q.quickReaction.name),
                                        "background-size": emojiBackSize(q.quickReaction.name),
                                        "height": "32px",
                                        "width": "32px",
                                        "image-rendering": "-webkit-optimize-contrast",
                                        "position": "absolute",
                                        "transform": "scale(0.7)",
                                        "filter": "grayscale(100%) brightness(80%)",
                                    }
                                  }));
                            }}
                        return React.createElement(Button, null);
                    }
                }
                retProps.unshift(React.createElement(ToolTip, {key: "quick-reaction"}));
            });

        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
                new Settings.Textbox("Emoji Name", "Type your emoji's name", this.quickReaction.name, (e) => {
                    this.quickReaction.name = e;
                    const url = 'https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/faceEmojisToPosition.json';
                    const response = fetch(url);
                    const data = response.then(function(resp) {return resp.text()});
                    data.then((d) => {
                        const emojis = JSON.parse(d).emojis;
                        this.emojis = emojis;
                        if(BdApi.loadData(config.info.name, "Emojis") !== null || BdApi.loadData(config.info.name, "Emojis") !== undefined)
                        BdApi.saveData(config.info.name, "Emojis", this.emojis);
                        else if(this.emojis !== BdApi.loadData(config.info.name, "Emojis"));
                        BdApi.saveData(config.info.name, "Emojis", this.emojis);
                        });
                    }),
                new Settings.Textbox("Emoji Id", "Leave blank if none", this.quickReaction.id, (e) => {
                    if(e === "") return this.quickReaction.id = null;
                    this.quickReaction.id = e;
                })
            )
        }
        saveSettings() {
            BdApi.saveData(config.info.name, "Emoji Name", this.quickReaction.name);
            BdApi.saveData(config.info.name, "Emoji Id", this.quickReaction.id);
        }

        onStop() {
            Patcher.unpatchAll();
        }
    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/