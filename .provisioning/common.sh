#!/usr/bin/env bash

# disable gnome-initial-setup welcome screens
VCONF=$VHOME/.config
mkdir -p $VCONF && chown vagrant:vagrant $VCONF
echo "yes" > $VCONF/gnome-initial-setup-done

# set en_US locale (defaults to en_UK) and US keymaps
localectl set-locale LANG=en_US.UTF-8
localectl set-keymap us

# disable repo search in case of "command not found" to prevent minor hang
sed -i 's/SoftwareSourceSearch=true/SoftwareSourceSearch=false/' \
    /etc/PackageKit/CommandNotFound.conf