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
    const config = {"info":{"name":"QuickReaction","authors":[{"name":"Kfir","discord_id":"302774260236025857","github_username":"KfirIL"}],"version":"1.0.0","description":"Lets you quickly use a selected emoji.","github":"","github_raw":"https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/QuickReaction.plugin.js"},"changelog":[{"title":"Release","items":["Thanks For Installing!"]}],"main":"index.js"};

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
        const plugin = module.exports = (Plugin, Library) => {
  const {
    Patcher,
    Logger,
    WebpackModules,
    DiscordModules,
    ContextMenu,
    Settings,
    Tooltip
  } = Library;
  const {
    React
  } = DiscordModules;
  return class QuickReaction extends Plugin {
    constructor() {
      super();
      this.quickReaction = {
        name: BdApi.loadData(config.info.name, "Emoji Name"),
        id: BdApi.loadData(config.info.name, "Emoji Id")
      };
      this.animated = BdApi.loadData(config.info.name, "Animated");
      this.emojis = BdApi.loadData(config.info.name, "Emojis");
    }

    onStart() {
      Patcher.before(Logger, "log", (t, a) => {
        a[0] = "Patched Message: " + a[0];
      });
      const ExpressionPicker = WebpackModules.getModule(m => m?.default?.displayName == 'ExpressionPickerContextMenu');
      Patcher.after(ExpressionPicker, "default", (_, args, ret) => {
        const quickReacionMenuItem = ContextMenu.buildMenuItem({
          id: "quick-reacion",
          label: "Set Quick reaction",
          action: () => {
            if (args[0].target.dataset.id !== undefined) {
              this.quickReaction.name = args[0].target.dataset.name;
              this.quickReaction.id = args[0].target.dataset.id;
              BdApi.saveData(config.info.name, "Emoji Name", this.quickReaction.name);
              BdApi.saveData(config.info.name, "Emoji Id", this.quickReaction.id);
            } else {
              this.quickReaction.id = null;
              BdApi.saveData(config.info.name, "Emoji Id", this.quickReaction.id);
              const url = 'https://raw.githubusercontent.com/KfirIL/BetterDiscordPlugins/main/QuickReaction/emojisToPosition.json';
              const response = fetch(url);
              const data = response.then(function (resp) {
                return resp.text();
              });
              data.then(d => {
                const emojis = JSON.parse(d).emojis;
                this.emojis = emojis;
                if (BdApi.loadData(config.info.name, "Emojis") === null || BdApi.loadData(config.info.name, "Emojis") === undefined) BdApi.saveData(config.info.name, "Emojis", this.emojis);else if (this.emojis !== BdApi.loadData(config.info.name, "Emojis")) ;
                BdApi.saveData(config.info.name, "Emojis", this.emojis);
              });
              const clickedEmojiBackPos = args[0].target.firstChild.style.backgroundPosition;
              const clickedEmojiBackImage = args[0].target.firstChild.style.backgroundImage;

              for (let i = 0; i < this.emojis.people.length; i++) {
                const element = this.emojis.people[i];

                if (element[1] === clickedEmojiBackPos && this.emojis.people[0][1] === clickedEmojiBackImage) {
                  this.quickReaction.name = element[0];
                  BdApi.saveData(config.info.name, "Emoji Name", this.quickReaction.name);
                  return;
                }
              }

              for (let i = 0; i < this.emojis.arms.length; i++) {
                const element = this.emojis.arms[i];

                if (element[1] === clickedEmojiBackPos && this.emojis.arms[0][1] === clickedEmojiBackImage) {
                  this.quickReaction.name = element[0];
                  BdApi.saveData(config.info.name, "Emoji Name", this.quickReaction.name);
                  return;
                }
              }
            }
          }
        });
        const menuItems = [ret.props.children];
        menuItems.push(quickReacionMenuItem);
        ret.props.children = menuItems;
      });
      const miniPopover = WebpackModules.getModule(m => m?.default?.displayName == 'MiniPopover');
      Patcher.after(miniPopover, "default", (_, args, ret) => {
        const retProps = ret.props.children;
        if (!(retProps && retProps[1].props) || !retProps[1].props.canReact) return;

        class ToolTip extends React.Component {
          constructor(props) {
            super(props);
            props.allowOverflow = false, props.color = "primary", props.forceOpen, props.hideOnClick = true, props.position = "top", props.shouldShow = true, props.spacing = 8, props.text = "Quick Reaction";
          }

          render() {
            const q = new QuickReaction();

            class Button extends React.Component {
              constructor() {
                super();
                this.tagName = 'div';
              }

              toolRef(e) {
                if (e !== null) new Tooltip(e, "Quick Reaction", {
                  style: "grey"
                });
              }

              emojiPos(emoji) {
                if (q.quickReaction.id !== null) return undefined;

                for (let i = 0; i < q.emojis.people.length; i++) {
                  const element = q.emojis.people[i];
                  if (element[0] === emoji) return element[1];
                }

                for (let i = 0; i < q.emojis.arms.length; i++) {
                  const element = q.emojis.arms[i];
                  if (element[0] === emoji) return element[1];
                }

                return q.emojis.default;
              }

              emojiUrl(emoji) {
                if (q.quickReaction.id !== null) return undefined;

                for (let i = 0; i < q.emojis.arms.length; i++) {
                  const element = q.emojis.arms[i];
                  if (element[0] === emoji) return q.emojis.arms[0][1];
                }

                return q.emojis.people[0][1];
              }

              customEmojiUrl(emoji) {
                const gifOrWebp = () => {
                  if (q.animated === true) return 'gif';else return 'webp';
                };

                if (emoji !== null) return 'https://cdn.discordapp.com/emojis/' + emoji + '.' + gifOrWebp() + '?size=48&quality=lossless';
              }

              emojiBackSize(emoji) {
                if (q.quickReaction.id !== null) return '32px';

                for (let i = 0; i < q.emojis.arms.length; i++) {
                  const element = q.emojis.arms[i];
                  if (element[0] === emoji) return q.emojis.arms[1][1];
                }

                return q.emojis.people[1][1];
              }

              customEmojiTag() {
                const emoji = q.quickReaction.id;
                if (emoji !== null) this.tagName = 'img';
              }

              render() {
                return /*#__PURE__*/React.createElement("div", {
                  className: "button-3bklZh",
                  ariaLabel: "Quick Reaction",
                  role: "button",
                  ref: this.toolRef,
                  tabindex: "0",
                  onClick: () => {
                    const reaction = WebpackModules.getByProps('addReaction', 'removeReaction');
                    if (q.emojis === undefined || q.quickReaction.name === undefined || q.quickReaction.name === "") return BdApi.showToast("You MUST first pick an emoji.", {
                      type: 'danger'
                    });
                    const messageReactions = retProps[2].props.message.reactions;

                    function add() {
                      reaction.addReaction(retProps[2].props.channel.id, retProps[2].props.message.id, q.quickReaction);
                    }

                    function remove() {
                      reaction.removeReaction(retProps[2].props.channel.id, retProps[2].props.message.id, q.quickReaction);
                    }

                    if (messageReactions.length === 0) return add();

                    for (let i = 0; i < messageReactions.length; i++) {
                      if (messageReactions[i].me && messageReactions[i].emoji.name === q.quickReaction.name && messageReactions[i].emoji.id === q.quickReaction.id) return remove();else if (i === messageReactions.length - 1) add();
                    }

                    ;
                  }
                }, this.customEmojiTag(), /*#__PURE__*/React.createElement(this.tagName, {
                  className: "emojiSpriteImage-3ykvhZ",
                  src: this.customEmojiUrl(q.quickReaction.id),
                  style: {
                    "background-image": this.emojiUrl(q.quickReaction.name),
                    "background-position": this.emojiPos(q.quickReaction.name),
                    "background-size": this.emojiBackSize(q.quickReaction.name),
                    "height": "32px",
                    "width": "32px",
                    "image-rendering": "-webkit-optimize-contrast",
                    "position": "absolute",
                    "transform": "scale(0.7)",
                    "filter": "grayscale(100%) brightness(80%)"
                  }
                }));
              }

            }

            return /*#__PURE__*/React.createElement(Button, null);
          }

        }

        retProps.unshift( /*#__PURE__*/React.createElement(ToolTip, {
          key: "quick-reaction"
        }));
      });
    }

    getSettingsPanel() {
      return Settings.SettingPanel.build(this.saveSettings.bind(this), new Settings.Switch("Animated", "Enable this if your emoji is animated", this.animated, e => {
        if (e) this.animated = true;else this.animated = false;
      }));
    }

    saveSettings() {
      BdApi.saveData(config.info.name, "Animated", this.animated);
    }

    onStop() {
      Patcher.unpatchAll();
    }

  };
};;
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/