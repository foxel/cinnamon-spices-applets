const Applet = imports.ui.applet;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const Util = imports.misc.util;

const UUID = 'nvidia-active@quickfox.ru';

function MyApplet(metadata, orientation, panel_height, instance_id) {
    this._init(metadata, orientation, panel_height, instance_id);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,
    
    _init: function(metadata, orientation, panel_height, instance_id) {
        Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instance_id);

        try {
            this.uuid = UUID;
            
            this.set_applet_tooltip(_("NVIDIA"));

            this.set_inactive_icon();
            this.is_nvidia_active();
            
            this.refresh_loop();
            global.log("Done initializing MuteToggler applet")
        } catch (e) {
            global.logError(e);
        }
    },
    
    refresh_loop: function() {
        this.is_nvidia_active();
        Mainloop.timeout_add(1000, Lang.bind(this, this.refresh_loop));
    },

    is_nvidia_active: function() {
        try {
            let cmd = [
                "bash",
                "-c",
                "cat /proc/driver/nvidia/gpus/*/power | grep 'Video Memory:' || echo 'error'"
            ];
            Util.spawn_async(cmd, (stdout) => {
                try {
                    if (stdout.indexOf("Active") !== -1) {
                        this.set_active_icon();
                    } else if (stdout.trim() === 'error') {
                        this.set_failed_icon();
                    } else {
                        this.set_inactive_icon();
                    }
                } catch(e) {
                    global.logError(e);
                }
            });
        } catch (e) {
            global.logError(e);
        }
    },

    set_inactive_icon: function() {
        this.set_applet_icon_name("inactive");
        this.set_applet_tooltip(_("NVIDIA GPU is inactive"));
    },

    set_active_icon: function() {
        this.set_applet_icon_name("active");
        this.set_applet_tooltip(_("NVIDIA GPU is active"));
    },
    
    set_failed_icon: function() {
        this.set_applet_icon_name("failed");
        this.set_applet_tooltip(_("Failed checking NVIDIA GPU status"));
    },

    on_applet_clicked: function(_event) {
        this.is_nvidia_active()
    }
};

function main(metadata, orientation, panel_height, instance_id) {
    return new MyApplet(metadata, orientation, panel_height, instance_id);
}
