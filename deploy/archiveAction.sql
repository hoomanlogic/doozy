
use hoomanlogic
go

create procedure [dbo].[archiveAction] (
	@ActionId uniqueidentifier
)
as
begin
	/**
	 * Archiving
	 */
	insert into ArchivedLogEntryPeanuts (
		[Id],
		[UserId],
		[LogEntryId],
		[Date],
		[Kind],
		[Comment],
		[AttachmentUri] 
	)
	select 
		p.[Id],
		p.[UserId],
		p.[LogEntryId],
		p.[Date],
		p.[Kind],
		p.[Comment],
		p.[AttachmentUri] 
	from dbo.[LogEntryPeanuts] p inner join dbo.[LogEntries] l on p.LogEntryId = l.Id
	where l.ActionId = @ActionId

	insert into ArchivedLogEntries (
		[Id],
		[ActionId],
		[RootActionId],
		[Date],
		[Entry],
		[Duration],
		[Details]
	)
	select 
		[Id],
		[ActionId],
		[RootActionId],
		[Date],
		[Entry],
		[Duration],
		[Details]
	from dbo.[LogEntries] 
	where [ActionId] = @ActionId

	insert into ArchivedActionsTags ([ActionId], [TagId])
	select [ActionId], [TagId]
	from dbo.[ActionsTags] 
	where ActionId = @ActionId

	insert into ArchivedActions (
		[Id],
		[UserId],
		[Name],
		[Kind],
		[Created],
		[Duration],
		[NextDate],
		[Content],
		[IsPublic],
		[ProjectStepId],
		[Ordinal]
	)
	select
		[Id],
		[UserId],
		[Name],
		[Kind],
		[Created],
		[Duration],
		[NextDate],
		[Content],
		[IsPublic],
		[ProjectStepId],
		[Ordinal]
	from Actions 
	where Id = @ActionId

	/**
	 * Deletion
	 */
	delete p 
	from dbo.[LogEntryPeanuts] p inner join dbo.[LogEntries] l on p.LogEntryId = l.Id 
	where l.ActionId = @ActionId
	
	delete from LogEntries 
	where ActionId = @ActionId
	
	delete from ActionsTags 
	where ActionId = @ActionId
	
	delete from Actions 
	where Id = @ActionId

end
go