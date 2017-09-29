# -*- mode: ruby -*-
# vi: set ft=ruby :

require './vars.rb'
$VARS[:VHOME] = "/home/vagrant"
$VARS[:DEV_VM_IP] = "192.168.56.78"
$VARS[:DEV_VM_HOSTNAME] = "dev.vm"
$VARS[:IDE_VM_IP] = "192.168.56.79"
$VARS[:IDE_VM_HOSTNAME] = "ide.vm"

%w[
  vagrant-vbguest
  vagrant-reload
].each do |plugin|
  if (ARGV[0] == 'up') && (Vagrant.has_plugin?(plugin) == false)
    puts " "
    puts "  Warning! Missing plugin!"
    puts "  -----------------------------------------"
    puts "  vagrant plugin install #{plugin}"
    puts "  -----------------------------------------"
    puts " "
    exit
  end
end

Vagrant.configure("2") do |config|
  # check/output version of vbox guest extensions on VM
  config.vbguest.no_install = true
  config.vm.synced_folder ".", "#{$VARS[:VHOME]}/workspace", disabled: false

  # local development server
  config.vm.define "dev", primary: true do |dev|
    dev.vm.box = "jhcook/fedora26"
    dev.vm.hostname = "dev.vm"
    dev.vm.network "private_network", ip: $VARS[:DEV_VM_IP]

    dev.vm.provider "virtualbox" do |v|
      v.memory = 2048
      v.cpus = 2
      v.gui = false
    end

    dev.vm.provision "file", source: ".provisioning/ide_id_rsa.pub",
      destination: "#{$VARS[:VHOME]}/.ssh/ide_id_rsa.pub.tmp"
    dev.vm.provision "shell", path: ".provisioning/common.sh", env: $VARS
    dev.vm.provision "shell", path: ".provisioning/dev.sh", env: $VARS

    # config.vm.provision :reload
  end

  # development IDE machine
  config.vm.define "ide", autostart: false do |ide|
    ide.vm.box = "jhcook/fedora26"
    ide.vm.hostname = "ide.vm"
    ide.vm.network "private_network", ip: $VARS[:IDE_VM_IP]

    ide.vm.provider "virtualbox" do |v|
      v.memory = 4096
      v.cpus = 4
      v.gui = true
      v.customize ["modifyvm", :id, "--vram", "128"]
      v.customize ["modifyvm", :id, "--clipboard", "bidirectional"]
    end

    ide.vm.provision "file", source: $VARS[:GIT_PRIVKEY_PATH],
      destination: "#{$VARS[:VHOME]}/.ssh/id_rsa"
    ide.vm.provision "file", source: ".provisioning/ide_id_rsa",
      destination: "#{$VARS[:VHOME]}/.ssh/ide_id_rsa"
    ide.vm.provision "shell", path: ".provisioning/common.sh", env: $VARS
    ide.vm.provision "shell", path: ".provisioning/ide.sh", env: $VARS

    # config.vm.provision :reload
  end
end
