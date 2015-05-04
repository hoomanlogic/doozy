	--Active Users
	select distinct a.Id, a.UserName from AspNetUsers a inner join Actions t on a.Id = t.UserId

	-- Delete Inactive Users
	delete from dbo.Connections where UserId not in (select distinct a.Id from AspNetUsers a inner join Actions t on a.Id = t.UserId)
	go
	delete from dbo.Connections where UserId_Connection not in (select distinct a.Id from AspNetUsers a inner join Actions t on a.Id = t.UserId)
	go
	delete from dbo.Personas where UserId not in (select distinct a.Id from AspNetUsers a inner join Actions t on a.Id = t.UserId)
	go
	delete from dbo.Focuses where UserId not in (select distinct a.Id from AspNetUsers a inner join Actions t on a.Id = t.UserId)
	go
	delete from dbo.Preferences where UserId not in (select distinct a.Id from AspNetUsers a inner join Actions t on a.Id = t.UserId)
	go
	delete from dbo.Tags where UserId not in (select distinct a.Id from AspNetUsers a inner join Actions t on a.Id = t.UserId)
	go
	delete from dbo.AspNetUsers where Id not in (select distinct a.Id from AspNetUsers a inner join Actions t on a.Id = t.UserId)