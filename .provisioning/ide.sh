#!/usr/bin/env bash

# add dev.vm to /etc/hosts
echo "$DEV_VM_IP   $DEV_VM_HOSTNAME   ${DEV_VM_HOSTNAME%.*}" >> /etc/hosts

# install chrome
cat << EOM > /etc/yum.repos.d/google-chrome.repo
[google-chrome]
name=google-chrome - \$basearch
baseurl=http://dl.google.com/linux/chrome/rpm/stable/\$basearch
enabled=1
gpgcheck=1
gpgkey=https://dl-ssl.google.com/linux/linux_signing_key.pub
EOM
dnf install google-chrome-stable -y

# configure project ssh key
PRIVKEY=$VHOME/.ssh/id_rsa
chmod 600 $PRIVKEY
chown vagrant:vagrant $PRIVKEY

# configure inter-VM ssh key
PRIVKEY_IDE=$VHOME/.ssh/ide_id_rsa
chmod 600 $PRIVKEY_IDE
chown vagrant:vagrant $PRIVKEY_IDE

SSH_CONFIG="$VHOME/.ssh/config"
echo -e "Host dev.vm dev\n    IdentityFile $VHOME/.ssh/ide_id_rsa" >> "$SSH_CONFIG"
chown vagrant:vagrant $SSH_CONFIG
chmod 600 $SSH_CONFIG

# configure git
cat << EOM > $VHOME/.gitconfig
[user]
name = "$GIT_NAME"
email = "$GIT_EMAIL"
EOM

# install vscode
rpm --import https://packages.microsoft.com/keys/microsoft.asc
sh -c 'echo -e "[vscode]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
dnf check-update
dnf install code -y

VSC_CONF_DIR=$VHOME/.config/Code
VSC_CONF_USER_DIR=$VSC_CONF_DIR/User
mkdir -p $VSC_CONF_USER_DIR
cat << EOM > $VSC_CONF_USER_DIR/settings.json
{
    "editor.rulers": [80],
    "files.eol": "\\n",
    "workbench.startupEditor": "none"
}
EOM
chown -R vagrant:vagrant $VHOME/.config

VSC_EXT_DIR=$VHOME/.vscode/extensions
mkdir -p $VSC_EXT_DIR
code --user-data-dir=$VSC_CONF_DIR \
    --extensions-dir=$VSC_EXT_DIR \
    --install-extension=eg2.tslint
chown -R vagrant:vagrant $VHOME/.vscode
