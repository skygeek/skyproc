### Introduction

Welcome to Skyproc ! Skyproc is a program designed to help you manage your dropzone in an open and friendly way while preserving data privacy and integrity. This chapter is a global presentation of Skyproc and how it works. Detailed description of each component will be covered by the next chapters. 

### Skyproc architecture

Skyproc is an integrated web application, it uses a modern Internet browser (chrome and safari are highly recommended) to deliver a local application look & feel inside the browser. Each Skyproc user creates an account with a login and a password to access the platform. Each user can act as a dropzone operator, a fun skydiver or both. 

A Skyproc platform is a Linux server packaged inside a downloadable virtual appliance ready to use. The virtual appliance can be played on almost any modern computer or laptop and let you deploy Skyproc within minutes. Skyproc is designed to run over the Internet, a single instance can be shared with multiple locations. Skyproc can also be deployed on a local network or installed on a single computer, without the need of an Internet access. 

[Skyproc.com](http://Skyproc.com/) is an instance of the Skyproc platform running in the cloud and freely available to everyone.

### Dropzones
Skyproc can handle an unlimited number of dropzones. Each dropzone is owned by the user who create it. When you create a dropzone, you have to setup differents things, like aircrafts and catalogs, or you can instruct Skyproc to create demonstration data so you can quickly start trying features. 

Other Skyproc users can see you dropzone if you configure it as a public dropzone, they can send you join requests to become members of your club and receive a profile with your specific settings. If you keep your dropzone private, you can still send join invitations that other users can review and accept. 

A Skyproc user can create any number of dropzones and have multiples memberships to other's dropzones. As a dropzone owner, you can also create members that are not Skyproc users, those members exists only in your dropzone database and don't have a login and a password to access the platform.

###Catalogs and Profiles

Catalogs are the way to setup the different types of jumps your dropzone is proposing. Catalog items can be configured with multiple prices in multiple currencies and can carry informations about any needed staff. Each dropzone have it's own catalog and each user have a global catalog where template items can be created and then copied to any of his dropzones.

Profiles or membership profiles are the mechanism used for setting individual parameters for a particular user or a group of users, profiles holds informations about default catalog items, prices, currencies, billing mode, etc... Each member of your dropzone belongs to a profile and you have the possibility to override any profile parameter for a specific member. 

### Lift manager

Lift Manager is a module for organizing aircraft loads. It is mainly an interactive dashboard that let you :

- schedule loads and broadcast boarding informations via a secondary screen. (or print on paper). 
- handle members self manifesting (if permitted). 
- automatically setup default catalog item and price per user. 
- automatic validation of aircraft requirements and members accounts. 
- archive loads for further reviews and report generation. 

### Clearance system

The clearance system, as his name indicates, is a system for delivering jump clearances. Clearances are delivered per member and have a validity period. Only members with a valid clearance can access the boarding interface of your dropzone to see planned loads and manifest themselves. 

Clearances system can be seen as a list of people that are present and jumping at your dropzone in a particular period of time, this can be useful for estimating your dropzone activity by having an insight at who is present in the clearance list. Clearances is also used to prevent abuses by restricting self manifesting to cleared members only. 

Clearances can be requested by members and reviewed for acceptability by the dropzone owner, or can be directly issued by the owner and sent to members. The clearances system can be completely disactivated if you wish, it is enabled by default. 

### Reports

When you start creating and archiving loads, reports are automatically created. There are 3 reports available :

- A synthetic dashboard with totals and some charts. 
- Loads reports: detailed records of loads. 
- Accounts report: detailed record of accounts operations. 

Reports can be displayed for a specific day or period of time. Each report has it's own filters that can used for browsing data. 

**P.S.** To archive a load, right-click on the load in the lift manager and click on 'Archive'. Loads in the 'Planned' state cannot be archived. 


### Logbook

Each Skyproc user who have the "fun jumper" profile activated have a logbook associated with his Skyproc account. This logbook is automatically maintained when the user perform jumps handled by the Skyproc platform where he is registered on. Users can also manually maintain their logbooks when jumping outside the Skyproc ecosystem. 

### internationalization

Skyproc has been designed from the ground with internationalization support. This include :

- A multi currency support for all prices and members accounts. 
- A preloaded list of all countries and major cities. 
- A configurable display of measuring units. 
- French translation of the user interface.

















