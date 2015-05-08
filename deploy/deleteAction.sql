
use hoomanlogic
go
delete from LogEntries where ActionId in (select Id from Actions where Kind != 'ToDo')
delete from ActionPathways where ChildId in (select Id from Actions where Kind != 'ToDo')
delete from ActionsTags where ActionId in (select Id from Actions where Kind != 'ToDo')
delete from Actions where Kind != 'ToDo'