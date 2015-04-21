-- merge actionlogs into another action
declare @keepActionId uniqueidentifier = '519008A9-7A4E-47AD-AE43-05DAC3F41454',
	    @obsoleteActionId uniqueidentifier = '3AECE08E-D34F-4F3F-B0B8-CEBDB4F833B0'

update l
set l.[ActionId] = @keepActionId, l.[Details] = a.[Name] + COALESCE(a.[Content],'') + COALESCE(l.[Details],'')
from [LogEntries] l inner join [Actions] a on l.ActionId = a.Id
where [ActionId] = @obsoleteActionId and [Entry] = 'performed'

delete from [LogEntries] where [ActionId] = @obsoleteActionId and [Entry] = 'created'
delete from [ActionsTags] where [ActionId] = @obsoleteActionId
delete from [Actions] where [Id] = @obsoleteActionId
