
-- blocks: need to be able to log an action on the fly, which tries to find an existing one, instead of adding a future todo/action
--         need recurring actions/todos to show in the next actions list
use [hoomanlogic]
go

create table [dbo].[Preferences] (
	[UserId] nvarchar(128) not null constraint [PK_Preferences] primary key,
	[WeekStarts] tinyint not null constraint [DF_Preferences_WeekStarts] default (0),
	[Location] varchar(100) null,
	[EmailNotifications] bit not null constraint [DF_Preferences_EmailNotifications] default (0),
    constraint [FK_Preferences_User] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[Focuses] (
	[Id] uniqueidentifier not null constraint [PK_Focuses] primary key,
	[UserId] nvarchar(128) not null,
	[Name] varchar(255) not null,
	[Kind] varchar(20) not null,
	[TagName] varchar(20) not null,
	[Enlist] datetime null,
	[Retire] datetime null,
	[IconUri] varchar(256) null,
	constraint [AK_Focuses] unique ([UserId], [Name]),
    constraint [FK_Focuses_User] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[Plans] (
	[Id] uniqueidentifier not null constraint [PK_Plans] primary key,
	[FocusId] uniqueidentifier not null,
	[UserId] nvarchar(128) not null,
	[Name] varchar(255) not null,
	[Kind] varchar(20) not null,
	[TagName] varchar(20) not null,
	[Enlist] datetime null,
	[Retire] datetime null,
	[Content] varchar(max) null,
	[IconUri] varchar(256) null,
	constraint [AK_Plans] unique ([UserId], [Name]),
    constraint [FK_Plans_Users] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade,
    constraint [FK_Plans_Focuses] foreign key (FocusId) 
    references [dbo].[Focuses] (Id) 
    on delete no action
    on update no action
)
go

create table [dbo].[PlanSteps] (
	[Id] uniqueidentifier not null constraint [PK_PlanSteps] primary key,
	[ProjectId] uniqueidentifier not null,
	[ParentId] uniqueidentifier null,
	[UserId] nvarchar(128) not null,
	[Name] varchar(255) not null,
	[Kind] varchar(20) not null,
	[Created] datetime null,
	[Duration] smallint null,
	[Status] varchar(20) not null constraint [DF_PlanSteps_Status] default ('Todo'), --Todo,Doing,Ready,Done
	[TagName] varchar(20) null,
	[Ordinal] smallint null,
	[Content] varchar(max) null,
	--constraint [AK_PlanSteps] unique ([ProjectId], [Name]),
 --   constraint [FK_PlanSteps_Projects] foreign key (ProjectId) 
 --   references [dbo].[Plans] (Id) 
 --   on delete cascade
 --   on update cascade
    --constraint [FK_PlanSteps_Users] foreign key (UserId) 
    --references [dbo].[AspNetUsers] (Id) 
    --on delete no action
    --on update no action,
    --constraint [FK_PlanSteps_Parent] foreign key (ParentId) 
    --references [dbo].[PlanSteps] (Id) 
    --on delete no action
    --on update no action
)
go

create table [dbo].[Actions] (
	[Id] uniqueidentifier not null constraint [PK_Actions] primary key,
	[UserId] nvarchar(128) not null,
	[Name] varchar(255) not null,
	[Kind] varchar(20) not null,
	[Created] datetime null,
	[Duration] smallint null,
	[NextDate] datetime null,
	[Content] varchar(max) null,
	[Ordinal] smallint null,
	[ProjectStepId] uniqueidentifier null,
	[IsPublic] bit not null constraint [DF_Actions_IsPublic] default (0),
	constraint [AK_Actions] unique ([UserId], [Name]),
    constraint [FK_Action_User] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade
    --constraint [FK_Actions_ProjectSteps] foreign key (ProjectStepId) 
    --references [dbo].[ProjectSteps] (Id) 
    --on delete no action
    --on update no action
)
go

create table [dbo].[ArchivedActions] (
	[Id] uniqueidentifier not null,
	[UserId] nvarchar(128) not null,
	[Name] varchar(255) not null,
	[Kind] varchar(20) not null,
	[Created] datetime null,
	[Duration] smallint null,
	[NextDate] datetime null,
	[Content] varchar(max) null,
	[Ordinal] smallint null,
	[ProjectStepId] uniqueidentifier null,
	[IsPublic] bit not null
)
go

create table [dbo].[Attachments] (
	[Id] uniqueidentifier not null constraint [PK_Attachments] primary key,
	[UserId] nvarchar(128) not null,
	[Name] varchar(100) not null,
	[Kind] varchar(10) not null constraint [DF_Attachments_Kind] default ('File'),
	[Path] varchar(256) not null, 
	constraint [AK_Attachments] unique ([UserId], [Path]),
	constraint [FK_Attachments_Users] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[ActionsAttachments] (
	[ActionId] uniqueidentifier not null,
	[AttachmentId] uniqueidentifier not null,
	constraint [PK_ActionsAttachments] primary key ([ActionId], [AttachmentId]),
	constraint [FK_ActionsAttachments_Attachments] foreign key ([AttachmentId])
	references [dbo].[Attachments] ([Id])
	on delete no action
    on update no action,
	constraint [FK_ActionsAttachments_Actions] foreign key ([ActionId])
	references [dbo].[Actions] ([Id])
	on delete no action
    on update no action
)
go

--create table [dbo].[ActionPathways] (
--	[RootId] uniqueidentifier not null,
--	[ParentId] uniqueidentifier not null,
--	[ChildId] uniqueidentifier not null,
--	[Order] tinyint null,
--	constraint [PK_[ActionPathways] primary key ([RootId], [ParentId], [ChildId]),
--	constraint [FK_ActionPathways_Root] foreign key ([RootId]) 
--    references [dbo].[Actions] (Id) 
--    on delete no action
--    on update no action,
--	constraint [FK_ActionPathways_Parent] foreign key ([ParentId]) 
--    references [dbo].[Actions] (Id) 
--    on delete no action
--    on update no action,
--	constraint [FK_ActionPathways_Child] foreign key ([ChildId]) 
--    references [dbo].[Actions] (Id) 
--    on delete no action
--    on update no action
--)

create table [dbo].[RecurrenceRules] (
	[ActionId] uniqueidentifier not null,
	[Rule] varchar(500) not null,
	constraint [PK_RecurrenceRules] primary key ([ActionId], [Rule]),
	constraint [FK_RecurrenceRules_Actions] foreign key (ActionId) 
    references [dbo].[Actions] (Id) 
    on delete cascade
    on update cascade
)
go
--select top 5 * from logentries order by date desc
--select * from logentries where id = '526EBE0D-455E-4750-9F95-AC6AA81A17F6'
--select * from logentriestags where logentryid = '526EBE0D-455E-4750-9F95-AC6AA81A17F6'
--alter table LogEntries alter column [UserId] nvarchar(128) not null
--update l 
--set l.UserId = a.UserId
--from LogEntries l inner join Actions a on l.ActionId = a.Id
--update l 
--set l.UserId = t.UserId
--from LogEntries l inner join (LogEntriesTags lt inner join Tags t on lt.TagId = t.Id) on l.Id = lt.LogEntryId

create table [dbo].[LogEntries] (
	[Id] uniqueidentifier not null constraint [PK_LogEntries] primary key,
	[UserId] nvarchar(128) not null,
	[ActionId] uniqueidentifier null,
	[RootActionId] uniqueidentifier null,
	[Date] datetime not null,
	[Entry] varchar(50) not null,
	[Duration] smallint null,
	[Details] varchar(MAX) null,
	constraint [FK_LogEntries_Actions] foreign key ([ActionId])
	references [dbo].[Actions] ([Id])
	on delete no action
    on update no action,
    constraint [FK_LogEntries_Users] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete no action
    on update no action
)
go

create table [dbo].[ArchivedLogEntries] (
	[Id] uniqueidentifier not null,
	[ActionId] uniqueidentifier not null,
	[RootActionId] uniqueidentifier null,
	[Date] datetime not null,
	[Entry] varchar(50) not null,
	[Duration] smallint null,
	[Details] varchar(MAX) null
)
go

create table [dbo].[LogEntryPeanuts] (
	[Id] uniqueidentifier not null constraint [PK_LogEntryPeanuts] primary key,
	[UserId] nvarchar(128) not null,
	[LogEntryId] uniqueidentifier not null,
	[Date] datetime not null,
	[Kind] varchar(10) not null constraint [DF_LogEntryPeanuts_Kind] default ('Support'),
	[Comment] varchar(1000) null,
	[AttachmentUri] varchar(256) null,
	constraint [FK_LogEntryPeanuts_LogEntries] foreign key (LogEntryId) 
    references [dbo].[LogEntries] (Id) 
    on delete cascade
    on update cascade,
	constraint [FK_LogEntryPeanuts_Users] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[ArchivedLogEntryPeanuts] (
	[Id] uniqueidentifier not null,
	[UserId] nvarchar(128) not null,
	[LogEntryId] uniqueidentifier not null,
	[Date] datetime not null,
	[Kind] varchar(10) not null,
	[Comment] varchar(1000) null,
	[AttachmentUri] varchar(256) null
)
go

create table [dbo].[TagKinds] (
	[Id] varchar(10) not null constraint [PK_TagKinds] primary key,
	[Symbol] nvarchar(128) not null
)
go

insert into [dbo].[TagKinds] values ('Focus', '!')
insert into [dbo].[TagKinds] values ('Place', '@')
insert into [dbo].[TagKinds] values ('Need', '$')
insert into [dbo].[TagKinds] values ('Goal', '>')
insert into [dbo].[TagKinds] values ('Box', '#')
insert into [dbo].[TagKinds] values ('Tag', '')
 
create table [dbo].[Tags] (
	[Id] uniqueidentifier not null constraint [PK_Tags] primary key,
	[UserId] nvarchar(128) not null,
	[Name] varchar(20) not null constraint [CK_Tags_Name] check (CHARINDEX(' ', [Name]) = 0),
	[Kind] varchar(10) not null constraint [DF_Tags_Kind] default ('Tag'),
	[Path] varchar(200) not null, -- must begin and end with backslash so we can test if a tag is a descendant without error in Target testing (ie. /learn/language/german
	[Content] varchar(max) null,
	constraint [AK_Tags] unique ([UserId], [Name]),
	constraint [FK_Tags_Users] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade,
	constraint [FK_Tags_TagKinds] foreign key (Kind) 
    references [dbo].[TagKinds] (Id) 
    on delete no action
    on update no action
)
go

create table [dbo].[LogEntriesTags] (
	[LogEntryId] uniqueidentifier not null,
	[TagId] uniqueidentifier not null,
	constraint [PK_LogEntriesTags] primary key ([LogEntryId], [TagId]),
	constraint [FK_LogEntriesTags_LogEntries] foreign key ([LogEntryId]) 
    references [dbo].[LogEntries] (Id) 
    on delete no action
    on update no action,
    constraint [FK_LogEntriesTags_Tags] foreign key ([TagId]) 
    references [dbo].[Tags] (Id) 
    on delete no action
    on update no action
)
go

create table [dbo].[ArchivedLogEntriesTags] (
	[LogEntryId] uniqueidentifier not null,
	[TagId] uniqueidentifier not null
)
go

--insert into LogEntriesTags (LogEntryId, TagId)
--select l.id, at.TagId
--from LogEntries l inner join (Actions a inner join ActionsTags at on a.Id = at.ActionId) on l.ActionId = a.Id

create table [dbo].[Targets] (
	[Id] uniqueidentifier not null constraint [PK_Targets] primary key,
	[UserId] nvarchar(128) not null,
	[Name] varchar(50) not null,
	[EntityType] varchar(10) not null,
	[EntityId] uniqueidentifier null,
	[Created] datetime not null,
	[Retire] datetime null,
	[Measure] tinyint not null,
	[Number] smallint not null,
	[Starts] datetime not null,
	[Period] tinyint not null,
	[Multiplier] smallint not null,
	[RetireWhenMet] bit not null constraint [DF_Targets_RetireWhenMet] default (0),
	constraint [FK_Targets_Users] foreign key (UserId) 
    references [dbo].[AspNetUsers] (Id) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[ActionsTags] (
	[ActionId] uniqueidentifier not null,
	[TagId] uniqueidentifier not null,
	constraint [PK_ActionsTags] primary key ([ActionId], [TagId]),
	constraint [FK_ActionsTags_Tags] foreign key ([TagId])
	references [dbo].[Tags] ([Id])
	on delete no action
    on update no action,
	constraint [FK_ActionsTags_Actions] foreign key ([ActionId])
	references [dbo].[Actions] ([Id])
	on delete no action
    on update no action
)
go

create table [dbo].[ArchivedActionsTags] (
	[ActionId] uniqueidentifier not null,
	[TagId] uniqueidentifier not null
)
go

create table [dbo].[Personas] (
	[UserId] nvarchar(128) not null,
	[Kind] varchar(50) not null,
	[KnownAs] varchar(50) null,
	[ProfileUri] varchar(256) null,
	constraint [PK_Personas] primary key ([UserId], [Kind]),
	constraint [FK_Personas_Users] foreign key ([UserId]) 
    references [dbo].[AspNetUsers] ([Id]) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[Connections] (
	[UserId] nvarchar(128) not null,
	[Persona] varchar(50) not null,
	[UserId_Connection] nvarchar(128) not null,
	[Persona_Connection] varchar(50) not null,
	constraint [PK_Connections] primary key ([UserId], [UserId_Connection]),
	constraint [FK_Connections_Users_User1] foreign key ([UserId]) 
    references [dbo].[AspNetUsers] ([Id]) 
    on delete cascade
    on update cascade,
	constraint [FK_Connections_Users_User2] foreign key ([UserId_Connection]) 
    references [dbo].[AspNetUsers] ([Id]) 
    on delete no action
    on update no action,
	constraint [FK_Connections_Personas1] foreign key ([UserId], [Persona]) 
    references [dbo].[Personas] ([UserId], [Kind]) 
    on delete no action
    on update no action,
	constraint [FK_Connections_Personas2] foreign key ([UserId_Connection], [Persona_Connection]) 
    references [dbo].[Personas] ([UserId], [Kind]) 
    on delete no action
    on update no action
)
go

create table [dbo].[ConnectionRequests] (
	[UserId] nvarchar(128) not null,
	[UserId_RequestedBy] nvarchar(128) not null,
	[Persona] varchar(50) not null,
	constraint [PK_ConnectionRequests] primary key ([UserId], [UserId_RequestedBy])
)
go

create table [dbo].[Messages] (
	[Id] uniqueidentifier not null constraint [PK_Messages] primary key,
	[UserId_From] nvarchar(128) not null,
	[UserId_To] nvarchar(128) not null,
	[Text] nvarchar(max) null,
	[Uri] varchar(255) null,
	[Sent] datetime not null constraint [DF_Messages_Sent] default (getutcdate()),
	[Read] datetime null,
	constraint [FK_Messages_Users_From] foreign key ([UserId_From]) 
    references [dbo].[AspNetUsers] ([Id]) 
    on delete cascade
    on update cascade,
	constraint [FK_Messages_Users_To] foreign key ([UserId_To]) 
    references [dbo].[AspNetUsers] ([Id]) 
    on delete no action
    on update no action
)
go

create table [dbo].[Achievements] (
	[Id] uniqueidentifier not null constraint [PK_Achievements] primary key,
	[UserId] nvarchar(128) not null,
	[Date] datetime null,
	[Content] nvarchar(max) null,
	[IsPublic] bit not null constraint [DF_Achievements_IsPublic] default (0),
	constraint [FK_Achievements_Users] foreign key ([UserId]) 
    references [dbo].[AspNetUsers] ([Id]) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[Notifications] (
	[Id] uniqueidentifier not null constraint [PK_Notifications] primary key,
	[UserId] nvarchar(128) not null,
	[OccurredAt] datetime not null,
	[Kind] varchar(128) not null,
	[Subject] varchar(128) not null,
	[Context] nvarchar(max) null,
	[ReadAt] datetime null,
	constraint [FK_Notifications_Users] foreign key ([UserId]) 
    references [dbo].[AspNetUsers] ([Id]) 
    on delete cascade
    on update cascade
)
go

create table [dbo].[Services] (
	[Id] uniqueidentifier not null constraint [PK_Services] primary key,
	[UserId] nvarchar(128) not null,
	[Persona] varchar(50) not null,
	[Kind] varchar(50) not null,
	constraint [AK_Services] unique ([UserId], [Persona], [Kind]),
)
go

create table [dbo].[Resources] (
	[Id] uniqueidentifier not null constraint [PK_Resources] primary key,
	[UserId] nvarchar(128) not null,
	[Persona] varchar(50) not null,
	[Kind] varchar(50) not null,
	constraint [AK_Resources] unique ([UserId], [PersonaId], [Kind]),
	[MayLend] bit not null constraint [DF_Resources_MayLend] default (0),
	[ForSale] bit not null constraint [DF_Resources_MayLend] default (0),
)
go