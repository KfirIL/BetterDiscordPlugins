/**
 * @name QuickFavoriteEmoji
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website 
 * @source 
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
    const config = {"info":{"name":"QuickFavoriteEmoji","authors":[{"name":"Kfir","discord_id":"302774260236025857","github_username":"KfirIL"}],"version":"1.0.0","description":"Lets you to quickly use your favorite emoji.","github":"","github_raw":""},"changelog":[{"title":"Release","items":["Thanks For Installing!"]}],"main":"index.js"};

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
    return class QuickFavoriteEmoji extends Plugin {
        constructor() {
            super();
            this.favoriteEmoji = {
                name: BdApi.loadData(config.info.name, "Emoji Name"),
                id: BdApi.loadData(config.info.name, "Emoji Id")
            }
            if(this.favoriteEmoji.name === null) this.favoriteEmoji.name = "😁";
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
                        class Button extends React.Component{
                            render() {
                                return React.createElement("div", {
                                    className: "button-3bklZh",
                                    "aria-label": "Quick Reaction",
                                    role: "button",
                                    ref: toolRef,
                                    tabindex: "0",
                                    onClick: () => {
                                        const q = new QuickFavoriteEmoji();
                                        const messageReactions = retProps[2].props.message.reactions;
                                        function add() {reaction.addReaction(retProps[2].props.channel.id, retProps[2].props.message.id, q.favoriteEmoji)}
                                        function remove() {reaction.removeReaction(retProps[2].props.channel.id, retProps[2].props.message.id, q.favoriteEmoji)}
                                        if(messageReactions.length === 0) return add();
                                        for(let i = 0; i < messageReactions.length; i++) {
                                            if(messageReactions[i].me && messageReactions[i].emoji.name === q.favoriteEmoji.name && messageReactions[i].emoji.id === q.favoriteEmoji.id) return remove();
                                            else if(i === messageReactions.length -1) add();
                                        };
                                    }
                                  }, React.createElement("svg", {
                                    className: "icon-1zidb7",
                                    width: "24",
                                    height: "24",
                                    viewBox: "0 0 24 24"
                                  }, React.createElement("path", {
                                    d: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
                                    fill: "currentColor"
                                  })));
                            }}
                        return React.createElement(Button, null);
                    }
                }
                retProps.unshift(React.createElement(ToolTip, {key: "quick-reaction"}));
            });

        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this), 
            new Settings.SettingGroup("Favorite Emoji").append(
                new Settings.Textbox("Emoji Name", "Type your emoji's name", this.favoriteEmoji.name, (e) => {
                    this.favoriteEmoji.name = e;
                    }),
                new Settings.Textbox("Emoji Id", "Leave blank if none", this.favoriteEmoji.id, (e) => {
                    if(e === "") return this.favoriteEmoji.id = null;
                    this.favoriteEmoji.id = e;
                })
                )
            )
        }
        saveSettings() {
            BdApi.saveData(config.info.name, "Emoji Name", this.favoriteEmoji.name);
            BdApi.saveData(config.info.name, "Emoji Id", this.favoriteEmoji.id);
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