#!/usr/bin/env bash

# install yarn / nodejs
wget https://dl.yarnpkg.com/rpm/yarn.repo -O /etc/yum.repos.d/yarn.repo
dnf install yarn -y

# install docker
dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo
dnf config-manager --set-enabled docker-ce-edge
dnf makecache
dnf install docker-ce -y
usermod -aG docker vagrant
systemctl enable docker

# configure inter-VM ssh key
PUBKEY="$VHOME/.ssh/ide_id_rsa.pub.tmp"
cat $PUBKEY >> "$VHOME/.ssh/authorized_keys"
rm $PUBKEY

# install mongo client
dnf install mongodb -y