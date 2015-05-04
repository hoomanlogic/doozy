use hoomanlogic
go

ALTER TRIGGER dbo.TR_AspNetUsers_AI
ON dbo.AspNetUsers
AFTER INSERT AS
BEGIN

	insert into dbo.Personas (UserId, Kind, KnownAs, ProfileUri) 
	select i.Id, 'Public', LEFT(i.UserName, 50), '/uploads/nopic.png'
	from inserted i

	insert into dbo.Preferences (UserId, WeekStarts, Location, EmailNotifications) 
	select i.Id, 0, LEFT(i.Hometown, 100), 1
	from inserted i

	insert into dbo.Focuses (Id, UserId, Name, Kind, Enlist, IconUri, TagName) 
	select NEWID(), i.Id, 'Hooman', 'Role', GETUTCDATE(), '/uploads/hooman.png', 'hooman' 
	from inserted i

	insert into dbo.Tags (Id, UserId, Name, Kind, [Path], IsFocus)
	select NEWID(), i.Id, 'hooman', 'Focus', '/hooman/', 1
	from inserted i

	insert into dbo.Connections (UserId, Persona, UserId_Connection, Persona_Connection)
	select i.Id, 'Public', 'db6f45f8-0c0e-4135-9a29-0be2c79a4eb1', 'Public'
	from inserted i

	insert into dbo.Connections (UserId, Persona, UserId_Connection, Persona_Connection)
	select 'db6f45f8-0c0e-4135-9a29-0be2c79a4eb1', 'Public', i.Id, 'Public'
	from inserted i

END
GO